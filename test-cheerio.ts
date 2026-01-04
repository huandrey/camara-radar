
import * as cheerio from 'cheerio';
import * as fs from 'fs';

const html = fs.readFileSync('debug-ordemdia.html', 'utf-8');
const $ = cheerio.load(html);

$('table.table tbody tr').each((i, element) => {
  const $row = $(element);
  const orderLink = $row.find('td:nth-child(1) a');
  const orderNumber = parseInt(orderLink.text().trim()) || 0;
  
  const contentCell = $row.find('td:nth-child(2)');
  const materiaLink = contentCell.find('a').first();
  const materiaId = parseInt(materiaLink.attr('id') || '0') || 0;
  const content = contentCell.text().trim().replace(/\s+/g, ' ');
  
  const detailsCell = $row.find('td:nth-child(3)');
  const ementa = detailsCell.find('.dont-break-out').first().text().trim();
  
  // Get text nodes for status
  // The structure is usually: DIV(Ementa) <br> TEXT <br> DIV(Obs)
  // or DIV(Ementa) <br> TEXT
  
  // Let's look at the contents
  let status = '';
  const contents = detailsCell.contents();
  
  contents.each((i, el) => {
      if (el.type === 'text') {
          const text = $(el).text().trim();
          if (text && text !== '-' && text !== '&nbsp;') {
             status += text + ' ';
          }
      }
  });
  
  // Clean up status
  status = status.replace(/^-\s*-\s*/, '').trim();

  const divs = detailsCell.find('.dont-break-out');
  const obs = divs.length > 1 ? divs.last().text().trim() : '';

  console.log(`Item ${orderNumber}:`);
  console.log(`  Ementa: ${ementa}`);
  console.log(`  Status: ${status}`);
  console.log(`  Obs: ${obs}`);
});
