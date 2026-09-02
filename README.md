# Auto WebP Image Manager

Automatically convert pasted/dragged images to WebP format, save them to a custom folder with note-based naming, and sync image renames when notes are renamed.

自动将粘贴/拖拽的图片转换为 WebP 格式，按笔记名称自动命名保存到指定文件夹，并在笔记重命名时同步更新图片名称及全库引用。

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

1. Open any note in Obsidian
2. Paste an image with `Ctrl+V` (or drag an image file into the editor)
3. The image is automatically converted to WebP, saved to your image folder, and a link is inserted
4. To rename images: simply rename the note, and all associated images will be renamed automatically
5. 在 Obsidian 中打开任意笔记
6. 用 `Ctrl+V` 粘贴图片（或将图片文件拖入编辑器）
7. 图片会自动转换为 WebP，保存到图片文件夹，并插入链接
8. 重命名图片：只需重命名笔记，所有关联图片会自动重命名

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

## Changelog / 更新日志

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
