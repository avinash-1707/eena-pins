import HomeHeader from '@/components/layout/HomeHeader';
import CategoryTabs from '@/components/layout/CategoryTabs';
import BottomNav from '@/components/layout/BottomNav';
import ProductGrid from '@/components/home/ProductGrid';
import { products } from '@/mockData/products';

 function Home() {
  // Map products to the format needed for ProductGrid
  const displayProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    imageUrl: product.imageUrl,
    
  }));

  return (
    <div className="min-h-screen dotted-background">
      <HomeHeader />
      <CategoryTabs 
        // onCategoryChange={(category) => console.log('Selected:', category)}
      />
      
      <main className="pt-32 pb-24">
        <ProductGrid products={displayProducts}
      
        />
      </main>

      <BottomNav />
    </div>
  );
}
export default Home;