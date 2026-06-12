const fs = require('fs');
const path = require('path');

const uploadsDir = path.resolve(__dirname, '..', 'uploads');

function productImage(product) {
  if (!product || !product.image || product.image === 'default-product.png') {
    const slugFile = path.join(uploadsDir, product?.slug + '.png');
    if (fs.existsSync(slugFile)) {
      product.image = product.slug + '.png';
    }
  }
  return product.image || 'default-product.png';
}

module.exports = { productImage };
