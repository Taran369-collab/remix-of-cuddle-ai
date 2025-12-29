import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Teddy Love</title>
        <meta name="description" content="Privacy Policy for Teddy Love - Learn how we collect, use, and protect your personal information." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
            <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-8 text-foreground/90">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <p className="leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us. This may include your name, email address, and any 
                  other information you choose to provide.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <p className="leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, 
                  communicate with you, and personalize your experience.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Cookies and Tracking Technologies</h2>
                <p className="leading-relaxed">
                  We use cookies and similar tracking technologies to collect information about your 
                  browsing activities. This includes cookies from third-party advertising partners like 
                  Google AdSense to serve personalized ads based on your interests.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Third-Party Advertising</h2>
                <p className="leading-relaxed mb-3">
                  We use Google AdSense to display advertisements on our website. Google may use cookies 
                  to serve ads based on your prior visits to our website or other websites. You can opt 
                  out of personalized advertising by visiting{" "}
                  <a 
                    href="https://www.google.com/settings/ads" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Ads Settings
                  </a>.
                </p>
                <p className="leading-relaxed">
                  For more information about how Google uses data when you use our site, visit{" "}
                  <a 
                    href="https://policies.google.com/technologies/partner-sites" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    How Google uses data
                  </a>.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                <p className="leading-relaxed">
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
                <p className="leading-relaxed">
                  You have the right to access, correct, or delete your personal information. You may also 
                  opt out of receiving promotional communications from us by following the instructions in 
                  those messages.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Children's Privacy</h2>
                <p className="leading-relaxed">
                  Our services are not directed to children under 13, and we do not knowingly collect 
                  personal information from children under 13.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us through our website.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
