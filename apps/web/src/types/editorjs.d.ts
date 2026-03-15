declare module '@editorjs/link' {
  import { BlockToolConstructable } from '@editorjs/editorjs'
  const LinkTool: BlockToolConstructable
  export default LinkTool
}

declare module '@editorjs/marker' {
  import { InlineToolConstructable } from '@editorjs/editorjs'
  const Marker: InlineToolConstructable
  export default Marker
}
