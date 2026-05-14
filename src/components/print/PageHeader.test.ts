import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './PageHeader';

const baseProps = {
  title: '漢字練習プリント',
  mode: 'writing' as const,
  date: '2026/05/14',
  isFirstPage: true,
  showNameField: true,
  showDateField: true,
  nameLabel: 'なまえ',
  dateLabel: 'ひづけ',
};

describe('PageHeader', () => {
  it('renders configurable labels on the first page', () => {
    const html = renderToStaticMarkup(createElement(PageHeader, baseProps));

    expect(html).toContain('漢字練習プリント');
    expect(html).toContain('ひづけ');
    expect(html).toContain('2026/05/14');
    expect(html).toContain('なまえ');
  });

  it('hides first page name and date fields independently', () => {
    const html = renderToStaticMarkup(
      createElement(PageHeader, {
        ...baseProps,
        showNameField: false,
        showDateField: false,
      }),
    );

    expect(html).not.toContain('ひづけ');
    expect(html).not.toContain('2026/05/14');
    expect(html).not.toContain('なまえ');
  });

  it('keeps the legacy header on later pages', () => {
    const html = renderToStaticMarkup(
      createElement(PageHeader, {
        ...baseProps,
        isFirstPage: false,
        showNameField: false,
        showDateField: false,
        nameLabel: 'Name',
        dateLabel: 'Date',
      }),
    );

    expect(html).toContain('漢字練習プリント');
    expect(html).toContain('2026/05/14');
    expect(html).not.toContain('Name');
    expect(html).not.toContain('Date');
  });
});
