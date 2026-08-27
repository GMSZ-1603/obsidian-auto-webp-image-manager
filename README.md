# Auto WebP Image Manager

An Obsidian plugin that automatically converts pasted/dragged images to WebP format, saves them with note-based naming, and sync-renames images when the note is renamed.

[中文说明](#中文说明)

## Features

- **Auto Convert**: Paste or drag images into a note and they are automatically converted to WebP format
- **Compression Quality**: Default 75%, adjustable in settings (0.1 - 1.0)
- **Resize**: Automatically downscale images exceeding the max width/height while preserving aspect ratio (default 1920×1080)
- **Auto Naming**: Images are named as `note-name-image-01.webp`, `note-name-image-02.webp`, etc.
- **Custom Folder**: All images are saved to a configurable folder (default `images/`)
- **Sync Rename**: When a note is renamed, all associated images and their references across the entire vault are automatically renamed
- **Reorder by Appearance**: On note rename, image indices are reassigned based on their order of appearance in the note
- **Skip Shared Images**: Images referenced by other notes are skipped during rename (default), preventing naming inconsistencies in other notes
- **Link Format**: Supports both Wikilink `![[name.webp]]` and Markdown `![](path/name.webp)`

## Installation

### From Obsidian Community Plugins

1. Open Obsidian → Settings → Community plugins
2. Turn off **Restricted mode** if not already off
3. Click **Browse** and search for **Auto WebP Image Manager**
4. Click **Install**
5. Enable the plugin

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/GMSZ-1603/obsidian-auto-webp-image-manager/releases)
2. Place them in `<vault>/.obsidian/plugins/auto-webp-image-manager/`
3. Open Obsidian → Settings → Community plugins
4. Enable **Auto WebP Image Manager**

### Via BRAT

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Add `GMSZ-1603/obsidian-auto-webp-image-manager` as a beta plugin

## Usage

1. In a note, press `Ctrl+V` to paste a screenshot or image, or drag an image into the editor
2. The image is automatically saved to `images/note-name-image-01.webp`
3. An image link is automatically inserted into the note
4. When you rename the note file, associated images are automatically renamed and all references across the vault are updated

## Configuration

Go to Settings → Community plugins → Auto WebP Image Manager → gear icon.

| Setting | Default | Description |
|---------|---------|-------------|
| Image folder | `images` | Folder path relative to vault root |
| Index digits | 2 | Padding for sequence number (01, 02, 03...) |
| WebP quality | 0.75 | 0.1-1.0, lower = smaller file, lower quality |
| Enable resize | on | Auto-downscale images exceeding max dimensions |
| Max width | 1920 | Pixels |
| Max height | 1080 | Pixels |
| Link format | Wikilink | Wikilink or Markdown |
| Handle paste | on | Process images on Ctrl+V |
| Handle drop | on | Process images on drag-and-drop |
| Sync rename on note rename | on | Auto-rename images when note is renamed |
| Rename shared images | off | When off (recommended), images referenced by other notes are not renamed. When on, all images are renamed regardless of references. |

## Naming and Reorder Example

Note name: `Project Proposal.md`

Images in the note (in order of appearance):
- 1st image: `images/Project Proposal-image-02.webp`
- 2nd image: `images/Project Proposal-image-01.webp`
- 3rd image: `images/Project Proposal-image-03.webp`

After renaming the note to `Updated Proposal.md`, indices are reassigned by appearance order:
- 1st image → `images/Updated Proposal-image-01.webp` (was 02)
- 2nd image → `images/Updated Proposal-image-02.webp` (was 01)
- 3rd image → `images/Updated Proposal-image-03.webp` (was 03)
- All references in the note (and any other notes referencing these images) are automatically updated

## Shared Image Behavior

When an image is referenced by multiple notes, renaming one note will **not** rename that image (default behavior). This prevents the image name from becoming inconsistent with the other note's name.

| Scenario | Behavior |
|----------|----------|
| Image only referenced by the renamed note | Renamed normally, indices reassigned by appearance |
| Image also referenced by other notes | Skipped, keeps original name, other notes unaffected |

To always rename shared images, enable "Rename shared images" in settings.

## Changelog

### v1.0.3
- **New**: Skip renaming images that are referenced by other notes (default), with a setting toggle to force rename
- **Fix**: Improved handling of shared images to prevent naming inconsistencies across notes

### v1.0.2
- **New**: On note rename, image indices are now reassigned based on their order of appearance in the note
- **New**: Orphan images (not referenced in the note) are appended at the end of the sequence

### v1.0.1
- **Fix**: Manifest description now ends with English punctuation for review compliance

### v1.0.0
- Initial release
- Auto convert pasted/dragged images to WebP
- Configurable quality and resize
- Note-based auto naming with sequence numbers
- Custom image folder
- Sync rename images on note rename with vault-wide reference updates
- Wikilink and Markdown link format support

## Notes

- If you also have Image Converter or Custom Attachment Location installed, there may be paste event conflicts. It is recommended to disable auto-paste handling in those plugins.
- Changes to the "Handle paste/drop" toggles require an Obsidian restart to take effect.
- Quality and resize settings only apply to newly pasted/dragged images; existing images are not converted automatically.

## License

MIT

---

## 中文说明

一个 Obsidian 插件：粘贴/拖拽图片自动转为 WebP 保存，按笔记名自动命名，笔记重命名时图片及全库引用同步重命名。

### 功能

- **自动转换**：粘贴或拖拽图片到笔记时，自动转为 WebP 格式
- **压缩质量**：默认 75%，可在设置中调节（0.1 - 1.0）
- **尺寸缩放**：超过最大宽高时自动缩小，保持宽高比（默认 1920×1080）
- **自动命名**：`笔记名-image-01.webp`、`笔记名-image-02.webp`...
- **指定文件夹**：图片统一保存到指定文件夹（默认 `images/`）
- **同步重命名**：笔记改名时，关联图片及全库引用自动更新
- **按出现顺序重编号**：笔记重命名时，图片序号按在笔记中出现的顺序重新分配
- **跳过共享图片**：被其他笔记引用的图片默认不重命名，避免其他笔记图片名不一致
- **链接格式**：支持 Wikilink `![[名.webp]]` 和 Markdown `![](路径/名.webp)`

### 安装

1. 下载最新 Release 中的 `main.js`、`manifest.json`、`styles.css`
2. 放到 `<库目录>/.obsidian/plugins/auto-webp-image-manager/`
3. 打开 Obsidian → 设置 → 第三方插件，启用 **Auto WebP Image Manager**

### 使用

1. 在笔记中按 `Ctrl+V` 粘贴截图或图片，或直接拖拽图片到编辑区
2. 图片自动保存到 `images/笔记名-image-01.webp`
3. 笔记中自动插入图片链接
4. 修改笔记文件名时，关联的图片及全库引用自动同步改名

### 共享图片行为

当一张图片被多篇笔记引用时，重命名其中一篇笔记**不会**重命名这张图片（默认行为），避免图片名与其他笔记名不一致。

| 场景 | 行为 |
|------|------|
| 图片仅被当前笔记引用 | 正常重命名，按出现顺序重新编号 |
| 图片也被其他笔记引用 | 跳过，保持原名，其他笔记不受影响 |

如需始终重命名共享图片，可在设置中开启"重命名被其他笔记引用的共享图片"。

### 更新日志

**v1.0.3**
- 新增：被其他笔记引用的共享图片默认不重命名，可通过设置开关强制重命名
- 修复：改进共享图片处理，避免跨笔记命名不一致

**v1.0.2**
- 新增：笔记重命名时，图片序号按在笔记中出现的顺序重新分配
- 新增：笔记中未引用的孤立图片排在序号末尾

**v1.0.1**
- 修复：manifest 描述以英文标点结尾，符合审核规范

**v1.0.0**
- 初始版本
