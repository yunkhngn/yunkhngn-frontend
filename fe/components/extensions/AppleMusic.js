import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core';

export const AppleMusic = Node.create({
  name: 'appleMusic',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'w-full md:w-1/2 rounded-2xl shadow-lg mx-auto block',
      },
      width: '100%',
      // Default height for standard player
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
        tag: 'iframe[src*="music.apple.com"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
      frameborder: '0',
      sandbox: 'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation',
      loading: 'lazy',
    })];
  },

  addCommands() {
    return {
      setAppleMusic:
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
        // Matches https://music.apple.com/us/album/song-name/123456789
        // or https://music.apple.com/us/playlist/playlist-name/pl.u-123456789
        find: /https?:\/\/music\.apple\.com\/([a-z]{2})\/(album|playlist|song|station)\/([^\/]+)\/([^\/?]+)(\?.*)?/g,
        type: this.type,
        getAttributes: (match) => {
          // match[0] is full url
          // We need to construct the embed URL.
          // Standard URL: https://music.apple.com/us/album/song/123
          // Embed URL: https://embed.music.apple.com/us/album/song/123
          
          const url = match[0];
          const embedUrl = url.replace('music.apple.com', 'embed.music.apple.com');
          
          return {
            src: embedUrl,
            height: match[2] === 'album' || match[2] === 'playlist' ? 450 : 152,
          };
        },
      }),
    ];
  },
});
