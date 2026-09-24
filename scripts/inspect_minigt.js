async function inspectAll() {
  const res = await fetch('https://www.minigtbrasil.com.br/api/products');
  const prods = await res.json();
  console.log('Total products in live API:', prods.length);

  const brandCounts = {};
  for (const p of prods) {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  }
  console.log('Brands found:', brandCounts);

  const miniGtItems = prods.filter(p => p.brand === 'Mini GT' || p.brand === 'MINI GT' || p.brand?.toLowerCase().includes('mini'));
  console.log('Mini GT items count:', miniGtItems.length);
  if (miniGtItems.length > 0) {
    console.log('Mini GT sample:', JSON.stringify(miniGtItems[0], null, 2));
  }
}

inspectAll();
