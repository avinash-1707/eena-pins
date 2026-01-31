import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetailHeader from '@/components/product/ProductDetailHeader';
import ProductImageSection from '@/components/product/ProductImageSection';
import ProductInfo from '@/components/product/ProductInfo';
import ProductFeatures from '@/components/product/ProductFeatures';
import ProductOptions from '@/components/product/ProductOptions';
import ProductDetailsSection from '@/components/product/ProductDetailsSection';
import ReviewsSection from '@/components/product/ReviewSection';
import ProductActions from '@/components/product/ProductActions';
import Header from '@/components/layout/HomeHeader';
import { products } from '@/mockData/products';
import { productDetails } from '@/mockData/productDetails';
import { ratings } from '@/mockData/userRatings';  // Changed this

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  const product = products.find(p => p.id === id);
  const details = productDetails.find(d => d.productId === id);
  const reviews = ratings.filter(r => r.productId === id);  // Changed this

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen dotted-background">
        <Header/>
      {/* <ProductDetailHeader /> */}
      
      <main className="pt-16 pb-24">
        <ProductImageSection 
          imageUrl={product.imageUrl}
          category={product.category}
          rating={details?.rating || 0}
        />

        <ProductInfo
          name={product.name}
          price={product.price}
          description={product.description}
          rating={details?.rating || 0}
          totalReviews={reviews.length}
        />

        {details && (
          <>
            <ProductOptions
              colors={details.moreOptions?.colors || []}
              sizes={details.moreOptions?.sizes || []}
            />
             // OLD
{/* <ProductActions 
  productId={product.id}
  price={product.price}
/> */}

<ProductActions product={product} />


           
            <ProductFeatures
          freeShipping={product.freeShippingOn}
          warrantyMonths={product.warrantyMonths}
          returnAvailable={product.returnAvailable}
        />

            <ProductDetailsSection
              brand={details.brand}
              material={details.material}
              keyFeatures={details.keyFeatures}
              moreOptions={details.moreOptions}
            />
          </>
        )}

        <ReviewsSection reviews={reviews} />

      </main>

    
    </div>
  );
}