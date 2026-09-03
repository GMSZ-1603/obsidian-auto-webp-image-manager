# Auto WebP Image Manager

Automatically convert pasted/dragged images to WebP format, save them to a custom folder with note-based naming, sync image renames when notes are renamed, batch rename images across all notes, and scan for unused/duplicate images.

自动将粘贴/拖拽的图片转换为 WebP 格式，按笔记名称自动命名保存到指定文件夹，笔记重命名时同步更新图片名称及全库引用，支持批量重命名所有笔记图片，并可扫描未使用和重复的图片。

## Features / 功能特性

- **Auto WebP Conversion**: Pasted or dragged images are automatically converted to WebP format with configurable quality (default 75%).
- **自动 WebP 转换**：粘贴或拖拽的图片自动转换为 WebP 格式，质量可配置（默认 75%）。
- **Note-based Naming**: Images are named as `{note-name}-image-{index}.webp`, e.g. `MyNote-image-01.webp`.
- **按笔记命名**：图片命名为 `{笔记名}-image-{序号}.webp`，例如 `我的笔记-image-01.webp`。
- **Custom Image Folder**: Save all images to a configurable folder (default: `图片`).
- **自定义图片文件夹**：所有图片保存到可配置的文件夹（默认：`图片`）。
- **Image Resizing**: Optionally resize images to fit within max width/height limits.
- **图片缩放**：可选择将图片缩放到最大宽度/高度限制内。
- **Auto Rename on Note Rename**: When a note is renamed, all its images are automatically renamed accordingly, and references across the entire vault are updated.
- **笔记重命名时自动同步**：笔记重命名时，其所有图片自动重命名，并更新全库中的引用。
- **Shared Image Protection**: Images referenced by other notes are skipped during renaming by default, to avoid breaking links in other notes.
- **共享图片保护**：被其他笔记引用的图片默认跳过重命名，避免破坏其他笔记的链接。
- **Sequential Reindexing**: On note rename, image indices are reassigned based on their order of appearance in the note.
- **按出现顺序重新编号**：笔记重命名时，图片序号按在笔记中出现的先后顺序重新分配。
- **Rename Images in Current Note**: Command to rename all images in the current note to the standard naming format, converting non-WebP images to WebP automatically.
- **重命名当前笔记图片**：命令将当前笔记中的所有图片重命名为标准格式，非 WebP 图片自动转换为 WebP。
- **Batch Rename All Notes**: Command to batch process all notes in the vault, renaming images to the standard format, skipping already-formatted images.
- **批量重命名所有笔记**：命令批量处理库中所有笔记，将图片重命名为标准格式，跳过已符合规范的图片。
- **Scan Unused & Duplicate Images**: Command to scan for images not referenced by any note, and duplicate images with identical content. Interactive modal lets you select and delete with one click (moved to system recycle bin).
- **扫描未使用和重复图片**：命令扫描未被任何笔记引用的图片，以及内容完全相同的重复图片。交互式弹窗可勾选并一键删除（移到系统回收站）。
- **Auto-update Links on Duplicate Deletion**: When deleting a duplicate image, all notes referencing it are automatically updated to reference the kept duplicate.
- **删除重复图片时自动更新引用**：删除重复图片时，所有引用它的笔记自动更新为引用保留的那张图片。

## Installation / 安装

### From Obsidian Community Plugins / 从 Obsidian 社区插件安装

1. Open Obsidian → Settings → Community plugins → Browse
2. Search for `Auto WebP Image Manager`
3. Click Install, then Enable
4. 打开 Obsidian → 设置 → 第三方插件 → 浏览
5. 搜索 `Auto WebP Image Manager`
6. 点击安装，然后启用

### Manual Installation / 手动安装

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/GMSZ-1603/obsidian-auto-webp-image-manager/releases)
2. Create a folder named `auto-webp-image-manager` in your vault's `.obsidian/plugins/` directory
3. Copy the three files into the folder
4. Restart Obsidian and enable the plugin in Community plugins settings
5. 从[最新版本](https://github.com/GMSZ-1603/obsidian-auto-webp-image-manager/releases)下载 `main.js`、`manifest.json` 和 `styles.css`
6. 在库的 `.obsidian/plugins/` 目录下创建名为 `auto-webp-image-manager` 的文件夹
7. 将三个文件复制到该文件夹中
8. 重启 Obsidian，在第三方插件设置中启用插件

## Usage / 使用方法

### Basic Usage / 基本使用

1. Open any note in Obsidian
2. Paste an image with `Ctrl+V` (or drag an image file into the editor)
3. The image is automatically converted to WebP, saved to your image folder, and a link is inserted
4. To rename images: simply rename the note, and all associated images will be renamed automatically
5. 在 Obsidian 中打开任意笔记
6. 用 `Ctrl+V` 粘贴图片（或将图片文件拖入编辑器）
7. 图片会自动转换为 WebP，保存到图片文件夹，并插入链接
8. 重命名图片：只需重命名笔记，所有关联图片会自动重命名

### Commands / 命令

Open the command palette with `Ctrl+P` and search for:

按 `Ctrl+P` 打开命令面板，搜索：

| Command / 命令 | Description / 说明 |
|---|---|
| **重命名当前笔记中的图片** | Rename all images in the current note to `{note-name}-image-{index}.webp` format. Non-WebP images are converted to WebP, original files are moved to recycle bin. / 将当前笔记中的所有图片重命名为标准格式，非 WebP 自动转换，原文件移到回收站。 |
| **批量重命名所有笔记中的图片** | Batch process all notes in the vault. Already-formatted images are skipped. Progress shown every 10 notes. / 批量处理库中所有笔记，已符合规范的图片跳过，每处理10篇显示进度。 |
| **扫描未使用和重复的图片** | Scan for images not referenced by any note and duplicate images with identical content. Interactive modal for review and one-click deletion. / 扫描未被引用的图片和内容重复的图片，交互式弹窗可勾选并一键删除。 |

## Configuration / 配置

| Setting / 设置 | Default / 默认值 | Description / 说明 |
|---|---|---|
| Image Folder / 图片文件夹 | `图片` | Folder to store converted images / 存储转换后图片的文件夹 |
| Quality / 质量 | `75%` | WebP compression quality (1-100) / WebP 压缩质量 (1-100) |
| Resize Enabled / 启用缩放 | `true` | Whether to resize large images / 是否缩放大图片 |
| Max Width / 最大宽度 | `1920` | Maximum image width in pixels / 图片最大宽度（像素） |
| Max Height / 最大高度 | `1080` | Maximum image height in pixels / 图片最大高度（像素） |
| Index Digits / 序号位数 | `2` | Number of digits for image index (e.g. 2 → 01, 02) / 图片序号位数（如 2 → 01, 02） |
| Link Format / 链接格式 | `wikilink` | Image link format: wikilink or markdown / 图片链接格式：wikilink 或 markdown |
| Rename On Note Rename / 笔记重命名时同步 | `true` | Automatically rename images when note is renamed / 笔记重命名时自动重命名图片 |
| Rename Shared Images / 重命名共享图片 | `false` | Rename images referenced by other notes (may break links) / 重命名被其他笔记引用的图片（可能破坏链接） |
| Handle Paste / 处理粘贴 | `true` | Convert images on paste / 粘贴时转换图片 |
| Handle Drop / 处理拖拽 | `true` | Convert images on drag-and-drop / 拖拽时转换图片 |

## Naming Example / 命名示例

For a note named `My Note`:
- First image: `My Note-image-01.webp`
- Second image: `My Note-image-02.webp`
- Third image: `My Note-image-03.webp`

对于名为 `我的笔记` 的笔记：
- 第一张图片：`我的笔记-image-01.webp`
- 第二张图片：`我的笔记-image-02.webp`
- 第三张图片：`我的笔记-image-03.webp`

## Shared Image Behavior / 共享图片行为

When a note is renamed, the plugin checks each image:
- If the image is **only referenced by the current note**, it is renamed to match the new note name.
- If the image is **also referenced by other notes**, it is **skipped by default** to avoid breaking links in those notes.
- You can enable "Rename Shared Images" in settings to force renaming all images, but this may break image links in other notes.

笔记重命名时，插件会检查每张图片：
- 如果图片**仅被当前笔记引用**，则重命名以匹配新笔记名。
- 如果图片**还被其他笔记引用**，则默认**跳过**，避免破坏其他笔记中的链接。
- 你可以在设置中启用"重命名共享图片"来强制重命名所有图片，但这可能会破坏其他笔记中的图片链接。

## Image Scanner / 图片扫描工具

The scan command provides two categories:

扫描命令提供两个分类：

### Unused Images / 未使用的图片
- Images that exist in the vault but are not referenced by any markdown note.
- 存在于库中但未被任何 markdown 笔记引用的图片。
- Use "Select All" / "Deselect All" buttons for quick selection. / 使用"全选"/"取消全选"按钮快速选择。

### Duplicate Images / 重复的图片
- Groups of images with identical file content (verified by size + content hash).
- 内容完全相同的图片组（通过文件大小 + 内容哈希验证）。
- The first image in each group is marked as "Keep" and cannot be deleted. / 每组第一张标记为"保留"，不可删除。
- When deleting a duplicate, all notes referencing it are automatically updated to reference the kept image. / 删除重复图片时，所有引用它的笔记自动更新为引用保留的图片。

### Deletion / 删除
- Selected images are moved to the **system recycle bin** (safe, recoverable). / 选中的图片移到**系统回收站**（安全，可恢复）。
- A summary notice shows how many images were deleted and how many links were updated. / 完成后显示删除数量和更新的引用数量。

## Changelog / 更新日志

### v1.0.9
- Feature: Add image scanner to find unused and duplicate images with interactive deletion modal
- Feature: Auto-update image links to kept duplicate when deleting duplicates
- 功能：新增图片扫描工具，可查找未使用和重复的图片，交互式弹窗勾选删除
- 功能：删除重复图片时，引用链接自动更新为保留的图片

### v1.0.8
- Feature: Add batch command to rename images in all notes, skip already-formatted images
- 功能：新增批量重命名所有笔记图片命令，跳过已符合规范的图片

### v1.0.7
- Fix: Update image links with correct path after renaming (images moved to image folder)
- Fix: Delete original non-WebP files after conversion (moved to recycle bin)
- 修复：重命名后图片链接路径正确更新（图片移到图片文件夹）
- 修复：非 WebP 图片转换后删除原文件（移到回收站）

### v1.0.6
- Feature: Add command to rename all images in current note to standard naming format
- 功能：新增命令，将当前笔记中的所有图片重命名为标准命名格式

### v1.0.5
- Fix: Remove BOM from plugin files for Obsidian compatibility
- 修复：移除插件文件中的 BOM 标记，确保 Obsidian 兼容性

### v1.0.4
- Fix: Remove auto newline after image link to preserve indentation format
- 修复：移除图片链接后的自动换行，保持缩进格式

### v1.0.3
- Feature: Skip shared images during note rename by default (configurable)
- 功能：笔记重命名时默认跳过共享图片（可配置）

### v1.0.2
- Feature: Reindex image numbers by order of appearance during note rename
- 功能：笔记重命名时按图片出现顺序重新编号

### v1.0.1
- Fix: manifest description punctuation
- 修复：manifest 描述标点符号

### v1.0.0
- Initial release
- 初始版本

## License / 许可证

MIT License
