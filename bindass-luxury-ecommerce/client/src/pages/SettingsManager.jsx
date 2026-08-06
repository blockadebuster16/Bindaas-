import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

const API_URL = 'http://localhost:5001/api/settings';

// ─── Reusable input card ───────────────────────────────────────────────────
const SettingCard = ({ title, description, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <div className="px-6 py-6 space-y-5">{children}</div>
  </div>
);

const Field = ({ label, hint, name, value, onChange, type = 'number', prefix, suffix, min = 0 }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-gray-400 text-sm font-medium pointer-events-none select-none">{prefix}</span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        step="any"
        className={`w-full bg-white border border-gray-200 rounded-lg py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-12' : 'pr-3'}`}
      />
      {suffix && (
        <span className="absolute right-3 text-gray-400 text-xs font-bold pointer-events-none select-none">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-[10px] text-gray-400 mt-1 italic">{hint}</p>}
  </div>
);

const Toggle = ({ label, hint, name, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      {hint && <p className="text-[10px] text-gray-400 mt-0.5 italic">{hint}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange({ target: { name, value: !checked, type: 'checkbox' } })}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────
const SettingsManager = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [form, setForm] = useState({
    cgst: 9,
    sgst: 9,
    shippingGst: 18,
    airRate: 54,
    surfaceRate: 42,
    codFee: 34,
    codEnabled: true,
    itemWeight: 300,
    unitWeight: 500,
    freeShippingThreshold: 0,
    climateFeeEnabled: true,
    climateFeeAmount: 25,
    climateFeeCause: 'Certified Mangrove Restoration Projects',
  });

  // ── Fetch settings on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(API_URL);
        setForm({
          cgst: data.cgst,
          sgst: data.sgst,
          shippingGst: data.shippingGst,
          airRate: data.airRate,
          surfaceRate: data.surfaceRate,
          codFee: data.codFee,
          codEnabled: data.codEnabled,
          itemWeight: data.itemWeight,
          unitWeight: data.unitWeight,
          freeShippingThreshold: data.freeShippingThreshold,
          climateFeeEnabled: data.climateFeeEnabled,
          climateFeeAmount: data.climateFeeAmount,
          climateFeeCause: data.climateFeeCause,
        });
      } catch (err) {
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? value : (type === 'text' ? value : Number(value))
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(API_URL, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Settings saved successfully ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Shipping preview ─────────────────────────────────────────────────────
  const preview = (() => {
    const qty = 2;
    const totalWeight = qty * form.itemWeight;
    const units = Math.ceil(totalWeight / form.unitWeight);
    const airBase = units * form.airRate;
    const surfBase = units * form.surfaceRate;
    const gstMult = 1 + form.shippingGst / 100;
    const airTotal = Math.round(airBase * gstMult);
    const surfTotal = Math.round(surfBase * gstMult);
    const codTotal = Math.round((surfBase + form.codFee) * gstMult);
    const combinedTaxRate = (form.cgst + form.sgst);
    return { qty, totalWeight, units, airTotal, surfTotal, codTotal, combinedTaxRate };
  })();

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-display overflow-hidden">

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 overflow-y-auto w-full">
        <form onSubmit={handleSave}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Store Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Configure taxes, shipping rates, and fulfilment rules that power every checkout.</p>
              </div>
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-black disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Save All Settings
                  </>
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── Left column ── */}
                <div className="xl:col-span-2 space-y-6">

                  {/* Taxation */}
                  <SettingCard
                    title="Taxation"
                    description="Applied separately at checkout. CGST + SGST are charged on the product subtotal; Shipping GST applies to delivery fees."
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <Field
                        label="CGST"
                        hint="Central GST on products (e.g. 9 = 9%)"
                        name="cgst"
                        value={form.cgst}
                        onChange={handleChange}
                        suffix="%"
                        min={0}
                      />
                      <Field
                        label="SGST"
                        hint="State GST on products (e.g. 9 = 9%)"
                        name="sgst"
                        value={form.sgst}
                        onChange={handleChange}
                        suffix="%"
                        min={0}
                      />
                      <Field
                        label="Shipping GST"
                        hint="Applied to all shipping and COD fees (e.g. 18 = 18%)"
                        name="shippingGst"
                        value={form.shippingGst}
                        onChange={handleChange}
                        suffix="%"
                        min={0}
                      />
                    </div>
                  </SettingCard>

                  {/* Shipping Rates */}
                  <SettingCard
                    title="Shipping Rates"
                    description="Base cost per 500g billing unit, before GST. Rates from Qikink (2026 pricing)."
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field
                        label="Air Shipping Rate (per unit)"
                        hint="Faster delivery, slightly higher cost"
                        name="airRate"
                        value={form.airRate}
                        onChange={handleChange}
                        prefix="₹"
                        min={0}
                      />
                      <Field
                        label="Surface Shipping Rate (per unit)"
                        hint="Standard delivery at a lower cost"
                        name="surfaceRate"
                        value={form.surfaceRate}
                        onChange={handleChange}
                        prefix="₹"
                        min={0}
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <Field
                        label="Free Shipping Threshold"
                        hint="Set to 0 to disable. Orders above this value (₹) get free shipping."
                        name="freeShippingThreshold"
                        value={form.freeShippingThreshold}
                        onChange={handleChange}
                        prefix="₹"
                        min={0}
                      />
                    </div>
                  </SettingCard>

                  {/* Weight Configuration */}
                  <SettingCard
                    title="Weight Configuration"
                    description="How weight is mapped from product quantities to shipping billing units."
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field
                        label="Weight per T-Shirt"
                        hint="Grams per individual apparel item (default 300g)"
                        name="itemWeight"
                        value={form.itemWeight}
                        onChange={handleChange}
                        suffix="g"
                        min={1}
                      />
                      <Field
                        label="Billing Unit Weight"
                        hint="Shipping is charged per this block of grams (default 500g)"
                        name="unitWeight"
                        value={form.unitWeight}
                        onChange={handleChange}
                        suffix="g"
                        min={1}
                      />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 leading-relaxed">
                      <strong className="text-gray-900">Formula: </strong>
                      Units = ⌈ (Items × {form.itemWeight}g) ÷ {form.unitWeight}g ⌉ &nbsp;→&nbsp;
                      e.g., 2 items = {Math.ceil((2 * form.itemWeight) / form.unitWeight)} billing unit(s)
                    </div>
                  </SettingCard>

                  {/* COD */}
                  <SettingCard
                    title="Cash on Delivery (COD)"
                    description="Flat fee charged per order for cash-on-delivery, before GST."
                  >
                    <Toggle
                      label="Enable COD"
                      hint="Allow customers to pay on delivery"
                      name="codEnabled"
                      checked={form.codEnabled}
                      onChange={handleChange}
                    />
                    {form.codEnabled && (
                      <Field
                        label="COD Collection Fee"
                        hint="Flat per-order fee added to COD orders, before GST"
                        name="codFee"
                        value={form.codFee}
                        onChange={handleChange}
                        prefix="₹"
                        min={0}
                      />
                    )}
                  </SettingCard>

                  {/* Climate Action Fee */}
                  <SettingCard
                    title="🌿 Climate Action Fee"
                    description="A non-refundable contribution per order supporting environmental restoration. Shown as an opt-out checkbox at checkout."
                  >
                    <Toggle
                      label="Enable Climate Action Fee"
                      hint="When enabled, customers see this at checkout (checked by default)"
                      name="climateFeeEnabled"
                      checked={form.climateFeeEnabled}
                      onChange={handleChange}
                    />
                    {form.climateFeeEnabled && (
                      <>
                        <Field
                          label="Fee Amount"
                          hint="Fixed amount per order in ₹ (non-refundable)"
                          name="climateFeeAmount"
                          value={form.climateFeeAmount}
                          onChange={handleChange}
                          prefix="₹"
                          min={0}
                        />
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cause Description</label>
                          <input
                            type="text"
                            name="climateFeeCause"
                            value={form.climateFeeCause}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-3 pr-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                            placeholder="e.g. Certified Mangrove Restoration Projects"
                          />
                          <p className="text-[10px] text-gray-400 mt-1 italic">Shown to customers at checkout as the cause they are supporting.</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-1">Customer will see:</p>
                          <p className="text-xs text-emerald-700 leading-relaxed italic">
                            "Contribute ₹{form.climateFeeAmount} to offset the carbon footprint of your delivery. This supports <strong>{form.climateFeeCause}</strong> and is non-refundable."
                          </p>
                        </div>
                      </>
                    )}
                  </SettingCard>
                </div>

                {/* ── Right column: Live Preview ── */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <h3 className="text-sm font-semibold text-gray-900">Live Cost Preview</h3>
                    </div>
                    <div className="px-6 py-6">
                      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                        Showing shipping cost for <strong className="text-gray-600">{preview.qty} T-shirts</strong> ({preview.totalWeight}g total → {preview.units} billing unit{preview.units !== 1 ? 's' : ''}).
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="text-xs font-semibold text-blue-800">Air Shipping</p>
                            <p className="text-[10px] text-blue-500 mt-0.5">Incl. {form.shippingGst}% GST</p>
                          </div>
                          <span className="text-lg font-black text-blue-900">₹{preview.airTotal}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                          <div>
                            <p className="text-xs font-semibold text-emerald-800">Surface Shipping</p>
                            <p className="text-[10px] text-emerald-500 mt-0.5">Incl. {form.shippingGst}% GST</p>
                          </div>
                          <span className="text-lg font-black text-emerald-900">₹{preview.surfTotal}</span>
                        </div>

                        {form.codEnabled && (
                          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                            <div>
                              <p className="text-xs font-semibold text-amber-800">Surface + COD</p>
                              <p className="text-[10px] text-amber-500 mt-0.5">Incl. ₹{form.codFee} COD fee + {form.shippingGst}% GST</p>
                            </div>
                            <span className="text-lg font-black text-amber-900">₹{preview.codTotal}</span>
                          </div>
                        )}

                        {form.freeShippingThreshold > 0 && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                              <p className="text-xs font-semibold text-gray-700">Free Shipping</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">For orders above ₹{form.freeShippingThreshold.toLocaleString()}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-500">₹0</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tax on a ₹2,000 cart (CGST + SGST = {preview.combinedTaxRate}%)</p>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>CGST ({form.cgst}%)</span>
                          <span className="font-semibold">₹{Math.round(2000 * form.cgst / 100)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>SGST ({form.sgst}%)</span>
                          <span className="font-semibold">₹{Math.round(2000 * form.sgst / 100)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1">
                          <span>Total Tax</span>
                          <span>₹{Math.round(2000 * (form.cgst + form.sgst) / 100)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Shipping GST ({form.shippingGst}%)</span>
                          <span className="font-semibold text-gray-300">Separate line</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default SettingsManager;
