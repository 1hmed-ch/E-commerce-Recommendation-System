// src/pages/LandingPage/components/NewsletterSection.jsx
const NewsletterSection = () => {
  return (
    <section className="py-16 bg-black">
      <div className="max-w-2xl mx-auto px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-light text-white mb-4">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-gray-300 mb-8 max-w-lg mx-auto text-sm font-light">
          Get exclusive deals, product updates, and special offers delivered straight to your inbox.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-white/10 border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 text-sm"
          />
          <button
            type="submit"
            className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-all text-sm tracking-wide"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;