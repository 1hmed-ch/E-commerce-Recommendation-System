import { BsTruck, BsShieldCheck, BsClock, BsStar } from "react-icons/bs";

const FEATURES = [
  {
    icon: <BsTruck className="text-xl" />,
    title: "Free Shipping",
    description: "On orders over $49"
  },
  {
    icon: <BsShieldCheck className="text-xl" />,
    title: "Secure Payment",
    description: "100% secure & encrypted"
  },
  {
    icon: <BsClock className="text-xl" />,
    title: "Fast Delivery",
    description: "2-4 business days"
  },
  {
    icon: <BsStar className="text-xl" />,
    title: "Premium Quality",
    description: "Curated selection"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="text-center">
              <div className="w-12 h-12 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                <div className="text-gray-700">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;