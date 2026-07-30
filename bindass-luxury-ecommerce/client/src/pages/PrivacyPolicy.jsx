import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-[#faf9f8] min-h-screen font-['Manrope'] pb-20">
            {/* Header section */}
            <div className="bg-white pt-32 pb-16 px-6 text-center border-b border-slate-100">
                <h1 className="text-4xl md:text-5xl font-black text-[#10221c] tracking-tighter uppercase mb-4">
                    Privacy Policy
                </h1>
                <p className="max-w-2xl mx-auto text-xs font-bold uppercase tracking-[0.3em] text-emerald-600">
                    Your Privacy at BiNDAAS!
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-16">
                <div className="bg-white p-8 md:p-16 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-[#10221c]/5">
                    
                    <div className="prose prose-slate max-w-none space-y-12 text-sm leading-relaxed text-slate-600">
                        
                        <section className="space-y-4">
                            <h2 className="text-lg font-black text-[#10221c] uppercase tracking-tight">1. Introduction</h2>
                            <p>
                                This Privacy Policy sets out how BiNDAAS! Luxury Private Limited (“BiNDAAS!”, “we”, “us”, “our”) uses and protects any personal information of users that we collect through our Platform. We are committed to ensuring that your privacy is protected and your Personal Information is used strictly in accordance with this Policy.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-lg font-black text-[#10221c] uppercase tracking-tight">2. Consent</h2>
                            <p>
                                BY USING THE PLATFORM OR AVAILING ANY SERVICES, YOU AGREE TO BE BOUND BY THIS PRIVACY POLICY. YOU HEREBY CONSENT TO OUR COLLECTION, USE AND SHARING OF YOUR INFORMATION AS DESCRIBED HEREIN.
                            </p>
                            <p>
                                You have the right to opt out at any time. By sending an email to <span className="text-emerald-600 font-bold underline cursor-pointer">connect@bindassluxury.com</span>, you can inquire about your data or request deletion of your information.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-lg font-black text-[#10221c] uppercase tracking-tight">3. What Information Do We Collect?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-[#10221c]">Information You Provide</h4>
                                    <p className="text-xs">Includes name, address, telephone number, email, date of birth, and financial information for payment processing.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-[#10221c]">Automatic Collection</h4>
                                    <p className="text-xs">Includes IP address, geolocation, device identifiers, and browsing behavior to personalize your shopping experience.</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 bg-slate-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                            <h2 className="text-lg font-black text-[#10221c] uppercase tracking-tight">4. How We Use It</h2>
                            <ul className="list-disc pl-5 space-y-2 text-xs">
                                <li>To create and maintain personalized accounts;</li>
                                <li>To process payments and fulfill orders;</li>
                                <li>To engage trusted third-parties for specialized services (AWS, KYC, etc.);</li>
                                <li>To improve site efficiency and develop new features;</li>
                                <li>To protect against fraud and unethical activity.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-lg font-black text-[#10221c] uppercase tracking-tight">5. Data Retention</h2>
                            <p>
                                We retain Personal Information for as long as necessary to fulfill the purposes outlined in this policy or as required by Indian law for legal, tax, or regulatory reasons.
                            </p>
                            <p className="font-bold text-red-800 uppercase tracking-widest text-[10px]">
                                NOTE: WE DO NOT STORE SENSITIVE FINANCIAL DETAILS LIKE PASSWORDS OR CVV CODES ON OUR SERVERS.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-lg font-black text-[#10221c] uppercase tracking-tight">6. Third-Party Sharing</h2>
                            <p>
                                We never commercially exploit your information by selling it to third parties. Sharing only occurs with service providers helping us deliver your order, or when required by government agencies for legal compliance.
                            </p>
                        </section>

                        <section className="space-y-4 pt-10 border-t border-slate-100">
                            <h2 className="text-lg font-black text-[#10221c] uppercase tracking-tight">Contact Our Privacy Office</h2>
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#10221c] mb-2">Grievance Officer</p>
                                    <p className="text-sm font-bold text-[#10221c]">Parth Manjrekar</p>
                                    <p className="text-xs text-slate-500">grievance@bindassluxury.com</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#10221c] mb-2">Operational Timing</p>
                                    <p className="text-xs text-slate-500">Mon - Sat: 10:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
