"use strict";

const { Plugin, Setting, Notice, TFile, TFolder, PluginSettingTab } = require("obsidian");

// ============================================================
// 默认配置
// ============================================================
const DEFAULT_SETTINGS = {
  imageFolder: "图片",
  filenamePrefix: "{noteName}-image",
  indexDigits: 2,
  outputFormat: "webp",
  quality: 0.75,
  resizeEnabled: true,
  maxWidth: 1920,
  maxHeight: 1080,
  linkFormat: "wikilink",
  renameImagesOnNoteRename: true,
  renameSharedImages: false,
  handleDrop: true,
  handlePaste: true,
  specialCharacters: "#^[]|*\\:<>?/",
  specialCharReplacement: "-"
};

// ============================================================
// 工具函数
// ============================================================
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeFileName(name, settings) {
  const chars = settings.specialCharacters || "#^[]|*\\:<>?/";
  const replacement = settings.specialCharReplacement || "-";
  let result = name;
  for (const ch of chars) {
    result = result.split(ch).join(replacement);
  }
  return result.replace(/\s+/g, " ").trim();
}

function padIndex(num, digits) {
  return String(num).padStart(digits || 2, "0");
}

// ============================================================
// 主插件类
// ============================================================
class AutoWebpImageManager extends Plugin {
  async onload() {
    await this.loadSettings();

    // 注册设置面板
    this.addSettingTab(new AutoWebpSettingTab(this.app, this));

    // 监听粘贴事件
    if (this.settings.handlePaste) {
      this.registerEvent(
        this.app.workspace.on("editor-paste", (evt, editor, ctx) => {
          this.handlePaste(evt, editor, ctx);
        })
      );
    }

    // 监听拖拽事件
    if (this.settings.handleDrop) {
      this.registerEvent(
        this.app.workspace.on("editor-drop", (evt, editor, ctx) => {
          this.handleDrop(evt, editor, ctx);
        })
      );
    }

    // 监听文件重命名事件（笔记重命名时同步图片）
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        this.handleNoteRename(file, oldPath);
      })
    );

    // 注册命令：重命名当前笔记中的图片
    this.addCommand({
      id: "rename-images-in-note",
      name: "重命名当前笔记中的图片（按笔记名-image-序号格式）",
      callback: () => {
        this.renameImagesInCurrentNote();
      }
    });

    console.log("[Auto WebP Image Manager] loaded");
  }

  onunload() {
    console.log("[Auto WebP Image Manager] unloaded");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // ============================================================
  // 粘贴处理
  // ============================================================
  async handlePaste(evt, editor, ctx) {
    const files = evt.clipboardData && evt.clipboardData.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    // 阻止默认粘贴行为
    evt.preventDefault();

    const noteFile = this.getNoteFile(ctx);
    if (!noteFile) {
      new Notice("无法获取当前笔记文件");
      return;
    }

    for (const file of imageFiles) {
      try {
        await this.processImageFile(file, noteFile, editor);
      } catch (err) {
        console.error("[Auto WebP] 处理图片失败:", err);
        new Notice("图片处理失败: " + (err.message || err));
      }
    }
  }

  // ============================================================
  // 拖拽处理
  // ============================================================
  async handleDrop(evt, editor, ctx) {
    if (!evt.dataTransfer) return;
    const files = evt.dataTransfer.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    evt.preventDefault();

    const noteFile = this.getNoteFile(ctx);
    if (!noteFile) {
      new Notice("无法获取当前笔记文件");
      return;
    }

    for (const file of imageFiles) {
      try {
        await this.processImageFile(file, noteFile, editor);
      } catch (err) {
        console.error("[Auto WebP] 处理拖拽图片失败:", err);
        new Notice("图片处理失败: " + (err.message || err));
      }
    }
  }

  // ============================================================
  // 获取当前笔记文件
  // ============================================================
  getNoteFile(ctx) {
    if (ctx && ctx.file) return ctx.file;
    return this.app.workspace.getActiveFile();
  }

  // ============================================================
  // 确保文件夹存在
  // ============================================================
  async ensureFolder(folderPath) {
    if (!folderPath) return;
    const exists = await this.app.vault.adapter.exists(folderPath);
    if (!exists) {
      // 递归创建父文件夹
      const parts = folderPath.split("/");
      let current = "";
      for (const part of parts) {
        if (!part) continue;
        current = current ? current + "/" + part : part;
        const e = await this.app.vault.adapter.exists(current);
        if (!e) {
          await this.app.vault.createFolder(current);
        }
      }
    }
  }

  // ============================================================
  // 生成下一个可用序号
  // ============================================================
  async getNextIndex(noteName, folderPath) {
    const prefix = sanitizeFileName(noteName, this.settings) + "-image-";
    let index = 1;
    while (index < 10000) {
      const num = padIndex(index, this.settings.indexDigits);
      const fileName = prefix + num + ".webp";
      const fullPath = folderPath ? folderPath + "/" + fileName : fileName;
      const exists = await this.app.vault.adapter.exists(fullPath);
      if (!exists) return index;
      index++;
    }
    return index;
  }

  // ============================================================
  // 图片处理核心：转换 -> 保存 -> 插入链接
  // ============================================================
  async processImageFile(file, noteFile, editor) {
    const noteName = noteFile.basename;
    const folderPath = this.settings.imageFolder || "";

    // 1. 确保目标文件夹存在
    await this.ensureFolder(folderPath);

    // 2. 获取下一个序号
    const index = await this.getNextIndex(noteName, folderPath);
    const cleanNoteName = sanitizeFileName(noteName, this.settings);
    const num = padIndex(index, this.settings.indexDigits);
    const fileName = cleanNoteName + "-image-" + num + ".webp";
    const fullPath = folderPath ? folderPath + "/" + fileName : fileName;

    // 3. 转换为WebP
    const arrayBuffer = await this.convertToWebp(file);

    // 4. 保存文件
    const savedFile = await this.app.vault.createBinary(fullPath, arrayBuffer);

    // 5. 在编辑器中插入链接
    this.insertImageLink(savedFile, noteFile, editor);

    console.log("[Auto WebP] 已保存:", fullPath);
  }

  // ============================================================
  // 转换图片为WebP（含缩放）
  // ============================================================
  async convertToWebp(fileOrBlob) {
    const blob = fileOrBlob instanceof Blob ? fileOrBlob : new Blob([fileOrBlob]);

    // 加载图片
    let image;
    if (typeof createImageBitmap === "function") {
      image = await createImageBitmap(blob);
    } else {
      image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });
    }

    let width = image.width;
    let height = image.height;

    // 缩放（保持宽高比）
    if (this.settings.resizeEnabled) {
      const maxW = this.settings.maxWidth || 1920;
      const maxH = this.settings.maxHeight || 1080;
      const ratio = Math.min(1, maxW / width, maxH / height);
      if (ratio < 1) {
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
    }

    // 绘制到Canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);

    // 释放资源
    if (image.close) image.close();

    // 转为WebP Blob
    const webpBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("WebP转换失败"))),
        "image/webp",
        this.settings.quality
      );
    });

    return await webpBlob.arrayBuffer();
  }

  // ============================================================
  // 在编辑器中插入图片链接
  // ============================================================
  insertImageLink(imageFile, noteFile, editor) {
    let linkText;

    if (this.settings.linkFormat === "markdown") {
      // Markdown格式: ![alt](相对路径)
      const mdLink = this.app.fileManager.generateMarkdownLink(imageFile, noteFile.path);
      // generateMarkdownLink 返回 [name](path)，加 ! 变成图片
      linkText = "!" + mdLink;
    } else {
      // Wikilink格式: ![[文件名.webp]]
      linkText = "![[" + imageFile.name + "]]";
    }

    // 在光标位置插入，后面加换行
    editor.replaceSelection(linkText);
  }

  // ============================================================
  // 笔记重命名时同步重命名关联图片，并更新全库所有引用该图片的笔记
  // ============================================================
  async handleNoteRename(file, oldPath) {
    if (!this.settings.renameImagesOnNoteRename) return;
    if (!(file instanceof TFile)) return;
    if (file.extension !== "md") return;

    // 解析旧笔记名和新笔记名
    const oldNoteName = oldPath.split("/").pop().replace(/\.md$/, "");
    const newNoteName = file.basename;

    if (oldNoteName === newNoteName) return; // 只是移动文件夹，文件名没变

    const cleanOld = sanitizeFileName(oldNoteName, this.settings);
    const cleanNew = sanitizeFileName(newNoteName, this.settings);

    if (cleanOld === cleanNew) return; // 清理后名字一样，无需处理

    // 查找所有匹配 旧笔记名-image-XX.webp 的图片文件
    const pattern = new RegExp("^" + escapeRegex(cleanOld) + "-image-(\\d+)\\.webp$");
    const matchedImages = this.app.vault.getFiles().filter((f) => {
      return f.extension === "webp" && pattern.test(f.name);
    });

    if (matchedImages.length === 0) return;

    // 检测哪些图片被其他笔记引用（共享图片），默认跳过重命名
    const sharedImageNames = new Set();
    if (!this.settings.renameSharedImages) {
      const allMdFilesForCheck = this.app.vault.getFiles().filter((f) => f.extension === "md");
      for (const mdFile of allMdFilesForCheck) {
        if (mdFile.path === file.path) continue; // 跳过当前笔记
        try {
          const content = await this.app.vault.read(mdFile);
          for (const imgFile of matchedImages) {
            if (content.includes(imgFile.name)) {
              sharedImageNames.add(imgFile.name);
            }
          }
        } catch (e) {
          // 跳过无法读取的文件
        }
      }
      if (sharedImageNames.size > 0) {
        console.log("[Auto WebP] 检测到", sharedImageNames.size, "张被其他笔记引用的共享图片，跳过重命名:", Array.from(sharedImageNames).join(", "));
      }
    }

    // 按图片在笔记中出现的顺序重新编号
    let noteContent = "";
    try {
      noteContent = await this.app.vault.read(file);
    } catch (e) {
      noteContent = "";
    }

    // 按出现顺序提取图片序号（去重，保留第一次出现的位置）
    const contentPattern = new RegExp(escapeRegex(cleanOld) + "-image-(\\d+)\\.webp", "g");
    const imageOrder = [];
    const seenIndexes = new Set();
    let cm;
    while ((cm = contentPattern.exec(noteContent)) !== null) {
      const idx = cm[1];
      if (!seenIndexes.has(idx)) {
        seenIndexes.add(idx);
        imageOrder.push(idx);
      }
    }

    // 建立旧序号 -> 新序号的映射（按笔记中出现顺序）
    const indexMap = {};
    imageOrder.forEach((oldIdx, i) => {
      indexMap[oldIdx] = padIndex(i + 1, this.settings.indexDigits);
    });

    console.log("[Auto WebP] 图片出现顺序:", imageOrder.join(", "), "-> 重新编号为 01~" + padIndex(imageOrder.length, this.settings.indexDigits));

    // 收集重命名映射（旧名 -> 新名），跳过目标已存在的
    const renameMap = [];

    // 先处理笔记中引用的图片（按出现顺序重新编号）
    for (const imgFile of matchedImages) {
      const match = imgFile.name.match(pattern);
      if (!match) continue;
      const oldIndex = match[1];
      if (!seenIndexes.has(oldIndex)) continue; // 孤立图片后面处理
      if (!this.settings.renameSharedImages && sharedImageNames.has(imgFile.name)) continue; // 共享图片跳过重命名
      const newIndex = indexMap[oldIndex];
      const newFileName = cleanNew + "-image-" + newIndex + ".webp";
      const newPath = imgFile.parent.path + "/" + newFileName;

      const targetExists = this.app.vault.getAbstractFileByPath(newPath);
      if (targetExists) {
        console.warn("[Auto WebP] 目标文件已存在，跳过:", newPath);
        continue;
      }
      renameMap.push({ imgFile, oldName: imgFile.name, newName: newFileName, newPath });
    }

    // 再处理笔记中没有引用的孤立图片（排在最后）
    let orphanIndex = imageOrder.length + 1;
    for (const imgFile of matchedImages) {
      const match = imgFile.name.match(pattern);
      if (!match) continue;
      const oldIndex = match[1];
      if (seenIndexes.has(oldIndex)) continue; // 已处理过
      if (!this.settings.renameSharedImages && sharedImageNames.has(imgFile.name)) continue; // 共享图片跳过重命名
      const newIndex = padIndex(orphanIndex++, this.settings.indexDigits);
      const newFileName = cleanNew + "-image-" + newIndex + ".webp";
      const newPath = imgFile.parent.path + "/" + newFileName;

      const targetExists = this.app.vault.getAbstractFileByPath(newPath);
      if (targetExists) {
        console.warn("[Auto WebP] 目标文件已存在，跳过:", newPath);
        continue;
      }
      renameMap.push({ imgFile, oldName: imgFile.name, newName: newFileName, newPath });
    }

    if (renameMap.length === 0) return;

    console.log("[Auto WebP] 笔记重命名，同步", renameMap.length, "张图片:", oldNoteName, "->", newNoteName);

    // 第一步：在重命名图片之前，扫描全库找出所有引用了这些图片的笔记
    const oldNames = renameMap.map((r) => r.oldName);
    const allMdFiles = this.app.vault.getFiles().filter((f) => f.extension === "md");
    const affectedFiles = [];

    for (const mdFile of allMdFiles) {
      try {
        const content = await this.app.vault.read(mdFile);
        for (const oldName of oldNames) {
          if (content.includes(oldName)) {
            affectedFiles.push(mdFile);
            break;
          }
        }
      } catch (e) {
        // 跳过无法读取的文件
      }
    }

    console.log("[Auto WebP] 找到", affectedFiles.length, "篇引用这些图片的笔记");

    // 第二步：重命名图片文件（Obsidian会自动更新wikilink格式引用）
    for (const item of renameMap) {
      try {
        await this.app.vault.rename(item.imgFile, item.newPath);
      } catch (err) {
        console.error("[Auto WebP] 图片重命名失败:", item.imgFile.path, "->", item.newPath, err);
      }
    }

    // 等待Obsidian完成自动链接更新
    await new Promise((r) => setTimeout(r, 300));

    // 第三步：更新所有受影响笔记中的链接
    // wikilink已由Obsidian自动更新，这里主要处理markdown格式链接和任何遗漏
    let updatedCount = 0;
    for (const mdFile of affectedFiles) {
      try {
        await this.app.vault.process(mdFile, (content) => {
          let newContent = content;
          let changed = false;
          for (const item of renameMap) {
            if (newContent.includes(item.oldName)) {
              newContent = newContent.split(item.oldName).join(item.newName);
              changed = true;
            }
          }
          if (changed) updatedCount++;
          return changed ? newContent : content;
        });
      } catch (err) {
        console.error("[Auto WebP] 更新笔记链接失败:", mdFile.path, err);
      }
    }

    new Notice("已同步重命名 " + renameMap.length + " 张图片，更新 " + updatedCount + " 篇笔记");
  }

  // ============================================================
  // 命令：重命名当前笔记中的图片（按笔记名-image-序号格式）
  // ============================================================
  async renameImagesInCurrentNote() {
    const noteFile = this.app.workspace.getActiveFile();
    if (!noteFile || noteFile.extension !== "md") {
      new Notice("请先打开一个笔记文件");
      return;
    }

    const noteName = noteFile.basename;
    const cleanNoteName = sanitizeFileName(noteName, this.settings);
    const folderPath = this.settings.imageFolder || "";

    // 1. 读取笔记内容
    let noteContent;
    try {
      noteContent = await this.app.vault.read(noteFile);
    } catch (e) {
      new Notice("无法读取笔记内容");
      return;
    }

    // 2. 提取所有图片链接（支持 wikilink 和 markdown 格式）
    const imageLinks = this.extractImageLinks(noteContent);

    if (imageLinks.length === 0) {
      new Notice("当前笔记中没有找到图片链接");
      return;
    }

    // 3. 去重（同一张图片可能被多次引用），保持出现顺序
    const uniqueImages = [];
    const seen = new Set();
    for (const link of imageLinks) {
      if (!seen.has(link.path)) {
        seen.add(link.path);
        uniqueImages.push(link);
      }
    }

    // 4. 检查每个图片文件是否存在（支持完整路径和wikilink文件名解析）
    const validImages = [];
    for (const img of uniqueImages) {
      let file = this.app.vault.getAbstractFileByPath(img.path);
      if (!file) {
        file = this.app.metadataCache.getFirstLinkpathDest(img.path, noteFile.path);
      }
      if (file && file instanceof TFile) {
        validImages.push({ ...img, file });
      } else {
        console.log("[Auto WebP] 图片文件不存在，跳过:", img.path);
      }
    }

    if (validImages.length === 0) {
      new Notice("没有找到有效的本地图片文件");
      return;
    }

    // 5. 确保目标文件夹存在
    await this.ensureFolder(folderPath);

    // 6. 生成处理计划（重命名或转换为webp）
    const renamePlan = [];
    let index = 1;

    for (const img of validImages) {
      const num = padIndex(index++, this.settings.indexDigits);
      const newFileName = cleanNoteName + "-image-" + num + ".webp";
      const newPath = folderPath ? folderPath + "/" + newFileName : newFileName;

      // 检查目标文件是否已存在
      const targetExists = this.app.vault.getAbstractFileByPath(newPath);
      if (targetExists) {
        console.log("[Auto WebP] 目标文件已存在，跳过:", newPath);
        continue;
      }

      renamePlan.push({
        oldFile: img.file,
        oldPath: img.file.path,
        oldName: img.file.name,
        newFileName,
        newPath,
        isWebp: img.file.extension === "webp"
      });
    }

    if (renamePlan.length === 0) {
      new Notice("没有需要处理的图片（目标文件名可能已存在）");
      return;
    }

    // 7. 扫描全库，找出所有引用这些图片的笔记
    const oldNames = renamePlan.map((r) => r.oldName);
    const allMdFiles = this.app.vault.getFiles().filter((f) => f.extension === "md");
    const affectedFiles = [];

    for (const mdFile of allMdFiles) {
      try {
        const content = await this.app.vault.read(mdFile);
        for (const oldName of oldNames) {
          if (content.includes(oldName)) {
            affectedFiles.push(mdFile);
            break;
          }
        }
      } catch (e) {
        // 跳过无法读取的文件
      }
    }

    console.log("[Auto WebP] 找到", affectedFiles.length, "篇引用这些图片的笔记");

    // 8. 执行处理：webp直接重命名，非webp转换后保存
    for (const item of renamePlan) {
      try {
        if (item.isWebp) {
          // 已经是webp，直接重命名
          await this.app.vault.rename(item.oldFile, item.newPath);
        } else {
          // 非webp，转换为webp后保存
          const arrayBuffer = await this.app.vault.readBinary(item.oldFile);
          const blob = new Blob([arrayBuffer]);
          const webpBuffer = await this.convertToWebp(blob);
          await this.app.vault.createBinary(item.newPath, webpBuffer);
          // 原文件保留，不删除（避免其他笔记引用断裂）
          console.log("[Auto WebP] 已转换为webp:", item.oldName, "->", item.newFileName);
        }
      } catch (err) {
        console.error("[Auto WebP] 图片处理失败:", item.oldPath, err);
      }
    }

    // 等待Obsidian完成自动链接更新
    await new Promise((r) => setTimeout(r, 300));

    // 9. 更新所有受影响笔记中的链接
    let updatedCount = 0;
    for (const mdFile of affectedFiles) {
      try {
        await this.app.vault.process(mdFile, (content) => {
          let newContent = content;
          let changed = false;
          for (const item of renamePlan) {
            if (newContent.includes(item.oldName)) {
              newContent = newContent.split(item.oldName).join(item.newFileName);
              changed = true;
            }
          }
          if (changed) updatedCount++;
          return changed ? newContent : content;
        });
      } catch (err) {
        console.error("[Auto WebP] 更新笔记链接失败:", mdFile.path, err);
      }
    }

    new Notice("已处理 " + renamePlan.length + " 张图片，更新 " + updatedCount + " 篇笔记");
    console.log("[Auto WebP] 批量重命名完成:", renamePlan.length, "张图片");
  }

  // ============================================================
  // 辅助：从笔记内容中提取所有图片链接
  // ============================================================
  extractImageLinks(content) {
    const links = [];

    // 匹配 wikilink 格式: ![[path]] 或 ![[path|alias]]
    const wikilinkRegex = /!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;
    let match;
    while ((match = wikilinkRegex.exec(content)) !== null) {
      const path = match[1].trim();
      links.push({ path, type: "wikilink", raw: match[0] });
    }

    // 匹配 markdown 格式: ![alt](path)
    const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    while ((match = markdownRegex.exec(content)) !== null) {
      let path = match[2].trim();
      try {
        path = decodeURIComponent(path);
      } catch (e) {
        // 保持原样
      }
      links.push({ path, type: "markdown", raw: match[0] });
    }

    return links;
  }
}


// ============================================================
// 设置面板
// ============================================================
class AutoWebpSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Auto WebP Image Manager 设置" });

    // --- 保存位置 ---
    containerEl.createEl("h3", { text: "保存位置" });

    new Setting(containerEl)
      .setName("图片保存文件夹")
      .setDesc("相对于库根目录的路径，例如：图片 或 Assets/Images")
      .addText((text) =>
        text
          .setPlaceholder("图片")
          .setValue(this.plugin.settings.imageFolder)
          .onChange(async (value) => {
            this.plugin.settings.imageFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    // --- 文件命名 ---
    containerEl.createEl("h3", { text: "文件命名" });

    new Setting(containerEl)
      .setName("序号位数")
      .setDesc("文件名中序号的补零位数，例如 2 → 01, 02")
      .addDropdown((drop) =>
        drop
          .addOption("1", "1 (1, 2, 3)")
          .addOption("2", "2 (01, 02, 03)")
          .addOption("3", "3 (001, 002)")
          .setValue(String(this.plugin.settings.indexDigits))
          .onChange(async (value) => {
            this.plugin.settings.indexDigits = parseInt(value);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("特殊字符替换")
      .setDesc("笔记名中包含这些字符时，替换为下方字符（Windows文件名不允许的字符）")
      .addText((text) =>
        text
          .setPlaceholder("#^[]|*\\:<>?/")
          .setValue(this.plugin.settings.specialCharacters)
          .onChange(async (value) => {
            this.plugin.settings.specialCharacters = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("替换为")
      .addText((text) =>
        text
          .setPlaceholder("-")
          .setValue(this.plugin.settings.specialCharReplacement)
          .onChange(async (value) => {
            this.plugin.settings.specialCharReplacement = value || "-";
            await this.plugin.saveSettings();
          })
      );

    // --- 图片转换 ---
    containerEl.createEl("h3", { text: "图片转换" });

    new Setting(containerEl)
      .setName("WebP 质量")
      .setDesc("0.1 - 1.0，默认 0.75（75%）。数值越小文件越小，画质越低。")
      .addSlider((slider) =>
        slider
          .setLimits(0.1, 1.0, 0.05)
          .setValue(this.plugin.settings.quality)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.quality = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("启用图片缩放")
      .setDesc("超过最大尺寸时自动缩小，保持宽高比")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.resizeEnabled).onChange(async (value) => {
          this.plugin.settings.resizeEnabled = value;
          await this.plugin.saveSettings();
          this.display(); // 刷新显示
        })
      );

    if (this.plugin.settings.resizeEnabled) {
      new Setting(containerEl)
        .setName("最大宽度 (px)")
        .addText((text) =>
          text
            .setPlaceholder("1920")
            .setValue(String(this.plugin.settings.maxWidth))
            .onChange(async (value) => {
              const n = parseInt(value);
              if (!isNaN(n) && n > 0) {
                this.plugin.settings.maxWidth = n;
                await this.plugin.saveSettings();
              }
            })
        );

      new Setting(containerEl)
        .setName("最大高度 (px)")
        .addText((text) =>
          text
            .setPlaceholder("1080")
            .setValue(String(this.plugin.settings.maxHeight))
            .onChange(async (value) => {
              const n = parseInt(value);
              if (!isNaN(n) && n > 0) {
                this.plugin.settings.maxHeight = n;
                await this.plugin.saveSettings();
              }
            })
        );
    }

    // --- 链接格式 ---
    containerEl.createEl("h3", { text: "链接格式" });

    new Setting(containerEl)
      .setName("插入链接格式")
      .setDesc("Wikilink: ![[图片.webp]] | Markdown: ![](路径/图片.webp)")
      .addDropdown((drop) =>
        drop
          .addOption("wikilink", "Wikilink (推荐)")
          .addOption("markdown", "Markdown")
          .setValue(this.plugin.settings.linkFormat)
          .onChange(async (value) => {
            this.plugin.settings.linkFormat = value;
            await this.plugin.saveSettings();
          })
      );

    // --- 行为开关 ---
    containerEl.createEl("h3", { text: "行为开关" });

    new Setting(containerEl)
      .setName("处理粘贴图片")
      .setDesc("Ctrl+V 粘贴图片时自动转换保存")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.handlePaste).onChange(async (value) => {
          this.plugin.settings.handlePaste = value;
          await this.plugin.saveSettings();
          new Notice("重启Obsidian后生效");
        })
      );

    new Setting(containerEl)
      .setName("处理拖拽图片")
      .setDesc("拖入图片时自动转换保存")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.handleDrop).onChange(async (value) => {
          this.plugin.settings.handleDrop = value;
          await this.plugin.saveSettings();
          new Notice("重启Obsidian后生效");
        })
      );

    new Setting(containerEl)
      .setName("笔记重命名时同步图片")
      .setDesc("笔记改名后，关联的 笔记名-image-XX.webp 自动改名，并更新链接")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.renameImagesOnNoteRename).onChange(async (value) => {
          this.plugin.settings.renameImagesOnNoteRename = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("重命名被其他笔记引用的共享图片")
      .setDesc("关闭时（推荐）：图片被其他笔记引用时不重命名，避免其他笔记图片名与笔记名不一致。开启时：一律重命名，所有引用同步更新。")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.renameSharedImages).onChange(async (value) => {
          this.plugin.settings.renameSharedImages = value;
          await this.plugin.saveSettings();
        })
      );

    // --- 说明 ---
    containerEl.createEl("h3", { text: "说明" });
    const desc = containerEl.createEl("div", {
      cls: "setting-item-description"
    });
    desc.innerHTML = `
      <p><b>命名规则：</b>笔记名-image-序号.webp（例如 项目方案-image-01.webp）</p>
      <p><b>同步重命名：</b>当笔记重命名时，所有匹配 旧笔记名-image-XX.webp 的图片会自动重命名，笔记内链接自动更新。</p>
      <p><b>注意：</b>修改"处理粘贴/拖拽"开关后需要重启Obsidian生效。</p>
    `;
  }
}

module.exports = AutoWebpImageManager;
