import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import { Products } from "@/components/Products";
import Benefits from "@/components/Benefits";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import AboutUs from "@/components/AboutUs";
import InspirationalQuote, { getRandomQuote } from "@/components/InspirationalQuote";
import { useMemo } from "react";

const Index = () => {
  const quote = useMemo(() => getRandomQuote(), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <InspirationalQuote quote={quote.quote} author={quote.author} className="bg-muted/30" />
        <Categories />
        <AboutUs />
        <Products />
        <Benefits />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;