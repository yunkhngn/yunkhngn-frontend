import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core';

export const Spotify = Node.create({
  name: 'spotify',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'w-full md:w-1/2 rounded-2xl shadow-lg mx-auto block',
      },
      width: '100%',
      height: 152,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[src*="spotify.com"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setSpotify:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: /https?:\/\/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)(\?.*)?/g,
        type: this.type,
        getAttributes: (match) => {
          const type = match[1];
          const id = match[2];
          return {
            src: `https://open.spotify.com/embed/${type}/${id}`,
            height: type === 'album' || type === 'playlist' ? 352 : 152,
          };
        },
      }),
    ];
  },
});
