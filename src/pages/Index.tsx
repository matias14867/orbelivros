import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedBooks from "@/components/FeaturedBooks";
import Benefits from "@/components/Benefits";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedBooks />
        <Benefits />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
