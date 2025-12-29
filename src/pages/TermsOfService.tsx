import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Teddy Love</title>
        <meta name="description" content="Terms of Service for Teddy Love - Read our terms and conditions for using our services." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-8 text-foreground/90">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing and using Teddy Love, you agree to be bound by these Terms of Service 
                  and all applicable laws and regulations. If you do not agree with any of these terms, 
                  you are prohibited from using or accessing this site.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                <p className="leading-relaxed mb-3">
                  Permission is granted to temporarily access the materials on Teddy Love for personal, 
                  non-commercial transitory viewing only. This is the grant of a license, not a transfer 
                  of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <p className="leading-relaxed">
                  When you create an account with us, you must provide accurate and complete information. 
                  You are responsible for safeguarding the password and for all activities that occur 
                  under your account.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">4. User Content</h2>
                <p className="leading-relaxed">
                  You retain ownership of any content you submit to our services. By submitting content, 
                  you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, 
                  and display such content in connection with our services.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Prohibited Activities</h2>
                <p className="leading-relaxed mb-3">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the service for any unlawful purpose</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Attempt to gain unauthorized access to any part of the service</li>
                  <li>Use any automated means to access the service</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Advertisements</h2>
                <p className="leading-relaxed">
                  The service may display advertisements provided by third parties, including Google AdSense. 
                  Your interactions with advertisers are solely between you and the advertiser, and we are 
                  not responsible for any loss or damage incurred as a result of such interactions.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Disclaimer</h2>
                <p className="leading-relaxed">
                  The materials on Teddy Love are provided on an 'as is' basis. We make no warranties, 
                  expressed or implied, and hereby disclaim and negate all other warranties including, 
                  without limitation, implied warranties or conditions of merchantability, fitness for 
                  a particular purpose, or non-infringement of intellectual property.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitations</h2>
                <p className="leading-relaxed">
                  In no event shall Teddy Love or its suppliers be liable for any damages arising out of 
                  the use or inability to use the materials on Teddy Love, even if we have been notified 
                  of the possibility of such damage.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
                <p className="leading-relaxed">
                  We may terminate or suspend your account and access to the service immediately, without 
                  prior notice or liability, for any reason whatsoever, including without limitation if 
                  you breach the Terms.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
                <p className="leading-relaxed">
                  These terms shall be governed by and construed in accordance with applicable laws, 
                  without regard to its conflict of law provisions.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
                <p className="leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. We will notify users 
                  of any changes by posting the new Terms on this page.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have any questions about these Terms, please contact us through our website.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
