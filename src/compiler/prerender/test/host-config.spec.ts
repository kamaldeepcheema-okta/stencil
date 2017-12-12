import { BuildConfig, HostConfig, HostRuleHeader, HydrateComponent, ManifestBundle } from '../../../util/interfaces';
import { addBundles, formatLinkRelPreloadHeader, getBundleIds, mergeUserHostConfig, sortComponents } from '../host-config';


describe('host-config', () => {

  describe('getBundleIds', () => {

    it('get used components', () => {
      const manifestBundles: ManifestBundle[] = [
        {
          moduleFiles: [
            {
              cmpMeta: {
                tagNameMeta: 'cmp-a',
                bundleIds: {
                  md: {
                    es2015: 'bundle-a'
                  }
                }
              },
            },
            {
              cmpMeta: {
                tagNameMeta: 'cmp-b',
                bundleIds: {
                  md: {
                    es2015: 'bundle-a'
                  }
                }
              },
            }
          ]
        },
        {
          moduleFiles: [
            {
              cmpMeta: {
                tagNameMeta: 'cmp-c',
                bundleIds: {
                  $: {
                    es2015: 'bundle-b'
                  }
                }
              },
            },
            {
              cmpMeta: {
                tagNameMeta: 'cmp-d',
                bundleIds: {
                  $: {
                    es2015: 'bundle-b'
                  }
                }
              },
            }
          ]
        }
      ];
      const components: HydrateComponent[] = [
        { tag: 'cmp-a' },
        { tag: 'cmp-b' },
        { tag: 'cmp-c' },
        { tag: 'cmp-d' }
      ];
      const bundleIds = getBundleIds(manifestBundles, components);

      expect(bundleIds.length).toBe(2);
      expect(bundleIds[0]).toBe('bundle-a');
      expect(bundleIds[1]).toBe('bundle-b');
    });

  });

  describe('sortComponents', () => {

    it('depth, then count, then tag', () => {
      const components: HydrateComponent[] = [
        { depth: 1, count: 1, tag: 'cmp-c' },
        { depth: 1, count: 1, tag: 'cmp-b' },
        { depth: 1, count: 1, tag: 'cmp-a' },

        { depth: 2, count: 1, tag: 'cmp-d' },
        { depth: 2, count: 2, tag: 'cmp-e' },
        { depth: 2, count: 3, tag: 'cmp-f' },

        { depth: 10, count: 1, tag: 'cmp-g' },
        { depth: 20, count: 1, tag: 'cmp-h' },
        { depth: 30, count: 1, tag: 'cmp-i' }
      ];
      const results = sortComponents(components);
      expect(results.length).toBe(9);

      expect(results[0].tag).toBe('cmp-i');
      expect(results[1].tag).toBe('cmp-h');
      expect(results[2].tag).toBe('cmp-g');
      expect(results[3].tag).toBe('cmp-f');
      expect(results[4].tag).toBe('cmp-e');
      expect(results[5].tag).toBe('cmp-d');
      expect(results[6].tag).toBe('cmp-a');
      expect(results[7].tag).toBe('cmp-b');
      expect(results[8].tag).toBe('cmp-c');
    });

  });

  describe('formatLinkRelPreloadHeader', () => {

    it('any file', () => {
      const h = formatLinkRelPreloadHeader('/some/path.whatever');
      expect(h.name).toBe('Link');
      expect(h.value).toBe('</some/path.whatever>;rel=preload');
    });

    it('css file', () => {
      const h = formatLinkRelPreloadHeader('/some/path.css');
      expect(h.name).toBe('Link');
      expect(h.value).toBe('</some/path.css>;rel=preload;as=style');
    });

    it('js file', () => {
      const h = formatLinkRelPreloadHeader('/some/path.js');
      expect(h.name).toBe('Link');
      expect(h.value).toBe('</some/path.js>;rel=preload;as=script');
    });

    it('image files', () => {
      const imgExts = [
        'png', 'gif', 'svg', 'jpg', 'jpeg', 'webp'
      ];

      imgExts.forEach(ext => {
        const h = formatLinkRelPreloadHeader(`/some/path.${ext}`);
        expect(h.name).toBe('Link');
        expect(h.value).toBe(`</some/path.${ext}>;rel=preload;as=image`);
      });
    });

  });

  describe('mergeUserHostConfig', () => {

    it('should do nothing for no user host config', () => {
      let userHostConfig: HostConfig = null;
      mergeUserHostConfig(userHostConfig, hostConfig);
      expect(hostConfig.hosting.rules.length).toBe(1);

      userHostConfig = { hosting: null };
      mergeUserHostConfig(userHostConfig, hostConfig);
      expect(hostConfig.hosting.rules.length).toBe(1);

      userHostConfig = { hosting: { rules: null } };
      mergeUserHostConfig(userHostConfig, hostConfig);
      expect(hostConfig.hosting.rules.length).toBe(1);

      userHostConfig = { hosting: { rules: [] } };
      mergeUserHostConfig(userHostConfig, hostConfig);
      expect(hostConfig.hosting.rules.length).toBe(1);
    });

    it('should merge rules', () => {
      const userHostConfig: HostConfig = {
        hosting: {
          rules: [
            {
              include: '/user/path',
              headers: [
                {
                  name: 'Link',
                  value: '</build/app/5e3mm8py.js>;rel=preload;as=script'
                 }
              ]
            }
          ]
        }
      };
      mergeUserHostConfig(userHostConfig, hostConfig);
      expect(hostConfig.hosting.rules.length).toBe(2);
      expect(hostConfig.hosting.rules[0].include).toBe('/user/path');
      expect(hostConfig.hosting.rules[1].include).toBe('/default/path');
    });

    var hostConfig: HostConfig = {
      hosting: {
        rules: [
          {
            include: '/default/path',
            headers: [
              {
                name: 'Link',
                value: '</build/app/5e3mm8py.js>;rel=preload;as=script'
               }
            ]
          }
        ]
      }
    };

  });

});
