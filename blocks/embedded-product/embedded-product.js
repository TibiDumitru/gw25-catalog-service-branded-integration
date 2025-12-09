/**
 * Embedded Product Block
 * 
 * This block allows embedding product details by SKU without requiring
 * the page to be on a product URL route. It wraps the product-details
 * block with the necessary initialization logic.
 * 
 * Usage in authoring:
 * | Embedded Product |
 * | SKU: adb169      |
 * 
 * Or with data attribute:
 * <div class="embedded-product" data-sku="adb169"></div>
 */

export default async function decorate(block) {
  // Get SKU from block content or data attribute
  const skuCell = block.querySelector('div');
  let sku = block.dataset.sku;
  
  if (!sku && skuCell) {
    // Extract SKU from block content (e.g., "SKU: adb169")
    const text = skuCell.textContent.trim();
    const match = text.match(/SKU:\s*(\S+)/i) || text.match(/^(\S+)$/);
    if (match) {
      sku = match[1];
    }
  }

  if (!sku) {
    block.classList.add('error');
    block.innerHTML = '<p>Error: No SKU provided. Please specify a SKU.</p>';
    return;
  }

  // Clear the block content
  block.innerHTML = '';
  block.classList.add('loading');

  try {
    // Add SKU meta tag so getProductSku() can find it
    let metaTag = document.querySelector('meta[name="sku"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'sku');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', sku);

    // Create product-details block element
    const productDetailsBlock = document.createElement('div');
    productDetailsBlock.className = 'product-details block';
    productDetailsBlock.dataset.blockName = 'product-details';
    productDetailsBlock.dataset.blockStatus = 'loading';
    
    block.appendChild(productDetailsBlock);

    // Import and decorate the product-details block
    const productDetailsModule = await import('../product-details/product-details.js');
    const decorateProductDetails = productDetailsModule.default;

    if (decorateProductDetails) {
      await decorateProductDetails(productDetailsBlock);
      block.classList.remove('loading');
      productDetailsBlock.dataset.blockStatus = 'loaded';
    } else {
      throw new Error('Product details decorator not found');
    }
  } catch (error) {
    console.error('Error loading embedded product:', error);
    block.classList.remove('loading');
    block.classList.add('error');
    block.innerHTML = `<p>Error loading product: ${error.message}</p>`;
  }
}

