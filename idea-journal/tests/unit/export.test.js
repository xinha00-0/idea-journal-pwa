import { jest } from '@jest/globals';
import { DataExporter } from '../../js/storage/export.js';
import { DataImporter } from '../../js/storage/import.js';

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
});

describe('DataExporter', () => {
  let exporter;
  let sampleIdeas;

  beforeEach(() => {
    exporter = new DataExporter();
    sampleIdeas = [
      {
        id: 1,
        title: '测试想法',
        content: '这是测试内容',
        tags: ['test', 'demo'],
        category: '技术',
        created: new Date('2025-01-15T10:00:00Z')
      },
      {
        id: 2,
        title: '另一个想法',
        content: '更多内容\n多行',
        tags: [],
        category: '',
        created: new Date('2025-01-16T12:00:00Z')
      }
    ];
  });

  describe('toJSON', () => {
    test('should export ideas as valid JSON string', () => {
      const result = exporter.toJSON(sampleIdeas);
      const parsed = JSON.parse(result);

      expect(parsed.version).toBe('1.0');
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.ideas).toHaveLength(2);
      expect(parsed.ideas[0].title).toBe('测试想法');
    });

    test('should handle empty ideas array', () => {
      const result = exporter.toJSON([]);
      const parsed = JSON.parse(result);

      expect(parsed.ideas).toHaveLength(0);
    });

    test('should produce pretty-printed JSON', () => {
      const result = exporter.toJSON(sampleIdeas);
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });
  });

  describe('toMarkdown', () => {
    test('should export ideas as markdown', () => {
      const result = exporter.toMarkdown(sampleIdeas);

      expect(result).toContain('# 想法记录导出');
      expect(result).toContain('## 测试想法');
      expect(result).toContain('## 另一个想法');
      expect(result).toContain('这是测试内容');
      expect(result).toContain('更多内容');
    });

    test('should include metadata', () => {
      const result = exporter.toMarkdown(sampleIdeas);

      expect(result).toContain('导出时间:');
      expect(result).toContain('共 2 条想法');
    });

    test('should include tags when present', () => {
      const result = exporter.toMarkdown(sampleIdeas);

      expect(result).toContain('**标签:** test, demo');
    });

    test('should include category when present', () => {
      const result = exporter.toMarkdown(sampleIdeas);

      expect(result).toContain('**分类:** 技术');
    });

    test('should separate ideas with horizontal rules', () => {
      const result = exporter.toMarkdown(sampleIdeas);

      expect(result).toContain('---');
    });

    test('should handle ideas without title', () => {
      const result = exporter.toMarkdown([{ content: 'some content', created: new Date() }]);

      expect(result).toContain('## 无标题');
    });
  });

  describe('createDownloadLink', () => {
    test('should create an anchor element with correct attributes', () => {
      const link = exporter.createDownloadLink('data', 'test.json', 'application/json');

      expect(link.tagName).toBe('A');
      expect(link.download).toBe('test.json');
      expect(link.href).toBeDefined();
      expect(link.style.display).toBe('none');

      link.remove();
    });

    test('should append link to document body', () => {
      const link = exporter.createDownloadLink('data', 'test.json', 'application/json');

      expect(document.body.contains(link)).toBe(true);

      link.remove();
    });
  });

  describe('exportAll', () => {
    let clickSpy;

    beforeEach(() => {
      clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    });

    afterEach(() => {
      clickSpy.mockRestore();
    });

    test('should export as JSON by default', () => {
      const result = exporter.exportAll(sampleIdeas);

      expect(result.filename).toMatch(/\.json$/);
      const parsed = JSON.parse(result.data);
      expect(parsed.ideas).toHaveLength(2);
    });

    test('should export as markdown when format is markdown', () => {
      const result = exporter.exportAll(sampleIdeas, 'markdown');

      expect(result.filename).toMatch(/\.md$/);
      expect(result.data).toContain('# 想法记录导出');
    });

    test('should export as markdown when format is md', () => {
      const result = exporter.exportAll(sampleIdeas, 'md');

      expect(result.filename).toMatch(/\.md$/);
    });

    test('should include date in filename', () => {
      const result = exporter.exportAll(sampleIdeas);

      expect(result.filename).toMatch(/ideas-export-\d{4}-\d{2}-\d{2}/);
    });
  });
});

describe('DataImporter', () => {
  let importer;
  let exporter;

  beforeEach(() => {
    importer = new DataImporter();
    exporter = new DataExporter();
  });

  describe('importJSON', () => {
    test('should import from JSON string with ideas array', () => {
      const json = JSON.stringify({
        version: '1.0',
        ideas: [
          { title: '想法1', content: '内容1', tags: ['a'], created: '2025-01-15T10:00:00Z' },
          { title: '想法2', content: '内容2', tags: [], created: '2025-01-16T10:00:00Z' }
        ]
      });

      const result = importer.importJSON(json);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('想法1');
      expect(result[1].title).toBe('想法2');
    });

    test('should import from plain JSON array', () => {
      const json = JSON.stringify([
        { title: '想法1', content: '内容1' }
      ]);

      const result = importer.importJSON(json);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('想法1');
    });

    test('should import from already parsed object', () => {
      const data = {
        version: '1.0',
        ideas: [{ title: '想法', content: '内容' }]
      };

      const result = importer.importJSON(data);

      expect(result).toHaveLength(1);
    });

    test('should throw on invalid format', () => {
      expect(() => importer.importJSON('{"other": "data"}')).toThrow('Invalid JSON format');
    });

    test('should normalize ideas with defaults', () => {
      const json = JSON.stringify({ ideas: [{}] });
      const result = importer.importJSON(json);

      expect(result[0].title).toBe('');
      expect(result[0].content).toBe('');
      expect(result[0].tags).toEqual([]);
      expect(result[0].created).toBeInstanceOf(Date);
    });

    test('should parse created date strings', () => {
      const json = JSON.stringify({
        ideas: [{ title: 't', created: '2025-06-01T00:00:00Z' }]
      });
      const result = importer.importJSON(json);

      expect(result[0].created).toBeInstanceOf(Date);
      expect(result[0].created.getFullYear()).toBe(2025);
    });
  });

  describe('importMarkdown', () => {
    test('should parse markdown with multiple ideas', () => {
      const md = `# 想法记录导出

导出时间: 2025/1/15
共 1 条想法

---

## 测试想法

> 创建时间: 2025/1/15 10:00:00

**标签:** tag1, tag2

这是内容部分

---

## 第二个想法

> 创建时间: 2025/1/16 12:00:00

另一个内容

---`;

      const result = importer.importMarkdown(md);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('测试想法');
      expect(result[0].tags).toEqual(['tag1', 'tag2']);
      expect(result[0].content).toContain('这是内容部分');
      expect(result[1].title).toBe('第二个想法');
    });

    test('should parse category from markdown', () => {
      const md = `## 标题

> 创建时间: 2025/1/15

**分类:** 技术

内容
---`;

      const result = importer.importMarkdown(md);

      expect(result[0].category).toBe('技术');
    });

    test('should handle empty markdown', () => {
      const result = importer.importMarkdown('');

      expect(result).toHaveLength(0);
    });

    test('should skip header section', () => {
      const md = `# 想法记录导出

导出时间: 2025/1/15

---

## 实际想法

> 创建时间: 2025/1/15

内容
---`;

      const result = importer.importMarkdown(md);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('实际想法');
    });
  });

  describe('importFile', () => {
    test('should import JSON file', async () => {
      const file = new File(
        [JSON.stringify({ ideas: [{ title: '从文件', content: '内容' }] })],
        'test.json',
        { type: 'application/json' }
      );

      const result = await importer.importFile(file);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('从文件');
    });

    test('should import markdown file', async () => {
      const md = `## MD想法

> 创建时间: 2025/1/15

内容
---`;
      const file = new File([md], 'test.md', { type: 'text/markdown' });

      const result = await importer.importFile(file);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('MD想法');
    });

    test('should reject unsupported file format', async () => {
      const file = new File(['data'], 'test.csv', { type: 'text/csv' });

      await expect(importer.importFile(file)).rejects.toThrow('Unsupported file format');
    });
  });

  describe('round-trip', () => {
    test('JSON export then import should preserve ideas', () => {
      const ideas = [
        { title: '想法A', content: '内容A', tags: ['x'], category: 'cat', created: new Date('2025-06-01T10:00:00Z') },
        { title: '想法B', content: '内容B', tags: ['y', 'z'], category: '', created: new Date('2025-06-02T10:00:00Z') }
      ];

      const json = exporter.toJSON(ideas);
      const imported = importer.importJSON(json);

      expect(imported).toHaveLength(2);
      expect(imported[0].title).toBe('想法A');
      expect(imported[0].tags).toEqual(['x']);
      expect(imported[0].category).toBe('cat');
      expect(imported[1].title).toBe('想法B');
      expect(imported[1].tags).toEqual(['y', 'z']);
    });

    test('Markdown export then import should preserve key data', () => {
      const ideas = [
        { title: '想法X', content: '内容X', tags: ['a', 'b'], category: '技术', created: new Date('2025-06-01T10:00:00Z') }
      ];

      const md = exporter.toMarkdown(ideas);
      const imported = importer.importMarkdown(md);

      expect(imported).toHaveLength(1);
      expect(imported[0].title).toBe('想法X');
      expect(imported[0].content).toContain('内容X');
      expect(imported[0].tags).toEqual(['a', 'b']);
      expect(imported[0].category).toBe('技术');
    });
  });
});
