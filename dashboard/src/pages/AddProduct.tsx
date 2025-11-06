import { useState } from 'react';
import { ArrowLeft, Upload, X, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface FAQ {
  question: string;
  answer: string;
}

interface ProductUnit {
  base_qty_per_unit: string;
  sale_price: string;
  is_default: boolean;
  sku: string;
  barcode: string;
  unit_id: number;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }]);
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([
    {
      base_qty_per_unit: '1',
      sale_price: '',
      is_default: true,
      sku: '',
      barcode: '',
      unit_id: 1
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    tax_fee: '0',
    manufacturer: '',
    usage: '',
    dosage: '',
    specification: '',
    adverseEffect: '',
    registNum: '',
    brand: '',
    producer: '',
    manufactor: '',
    legalDeclaration: '',
    category_id: '',
    supplier_id: '',
    base_unit_id: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const addProductUnit = () => {
    setProductUnits([...productUnits, {
      base_qty_per_unit: '1',
      sale_price: '',
      is_default: false,
      sku: '',
      barcode: '',
      unit_id: 1
    }]);
  };

  const removeProductUnit = (index: number) => {
    if (productUnits.length > 1) {
      setProductUnits(productUnits.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      images,
      faq: faqs,
      productUnits,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    console.log('Product Data:', productData);
    // TODO: API call to save product
    navigate('/products');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/products"
          className="p-2 hover:bg-white rounded-xl transition-all duration-200 border border-gray-200"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Add New Product
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Fill in the product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter product name"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (VND) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Fee (%)</label>
              <input
                type="number"
                value={formData.tax_fee}
                onChange={(e) => setFormData({ ...formData, tax_fee: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
              <input
                type="text"
                value={formData.registNum}
                onChange={(e) => setFormData({ ...formData, registNum: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter registration number"
              />
            </div>
          </div>
        </div>

        {/* Images Upload */}
        <div className="bg-gradient-to-br from-white to-purple-50/20 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
            Product Images
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload size={40} className="text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 font-semibold">Click to upload images</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Manufacturer Information */}
        <div className="bg-gradient-to-br from-white to-green-50/20 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
            Manufacturer Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter manufacturer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Producer</label>
              <input
                type="text"
                value={formData.producer}
                onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter producer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country of Manufacture</label>
              <input
                type="text"
                value={formData.manufactor}
                onChange={(e) => setFormData({ ...formData, manufactor: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter country"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specification</label>
              <input
                type="text"
                value={formData.specification}
                onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g., Hộp, Chai, Lọ"
              />
            </div>
          </div>
        </div>

        {/* Usage & Dosage */}
        <div className="bg-gradient-to-br from-white to-orange-50/20 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">4</span>
            Usage & Dosage Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Instructions</label>
              <textarea
                rows={4}
                value={formData.usage}
                onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Enter usage instructions"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage Information</label>
              <textarea
                rows={4}
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Enter dosage information"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adverse Effects</label>
              <textarea
                rows={4}
                value={formData.adverseEffect}
                onChange={(e) => setFormData({ ...formData, adverseEffect: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Enter adverse effects information"
              />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-br from-white to-pink-50/20 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">5</span>
              Frequently Asked Questions
            </h2>
            <button
              type="button"
              onClick={addFAQ}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-pink-600 transition-all shadow-md"
            >
              <Plus size={18} />
              Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-bold text-gray-500">FAQ #{index + 1}</span>
                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFAQ(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm"
                    placeholder="Enter question"
                  />
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none text-sm"
                    placeholder="Enter answer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Units */}
        <div className="bg-gradient-to-br from-white to-indigo-50/20 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">6</span>
              Product Units
            </h2>
            <button
              type="button"
              onClick={addProductUnit}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-md"
            >
              <Plus size={18} />
              Add Unit
            </button>
          </div>

          <div className="space-y-4">
            {productUnits.map((unit, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-bold text-gray-500">Unit #{index + 1}</span>
                  {productUnits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductUnit(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus size={18} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={unit.sku}
                    onChange={(e) => {
                      const newUnits = [...productUnits];
                      newUnits[index].sku = e.target.value;
                      setProductUnits(newUnits);
                    }}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    placeholder="SKU"
                  />
                  <input
                    type="text"
                    value={unit.barcode}
                    onChange={(e) => {
                      const newUnits = [...productUnits];
                      newUnits[index].barcode = e.target.value;
                      setProductUnits(newUnits);
                    }}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    placeholder="Barcode"
                  />
                  <input
                    type="number"
                    value={unit.sale_price}
                    onChange={(e) => {
                      const newUnits = [...productUnits];
                      newUnits[index].sale_price = e.target.value;
                      setProductUnits(newUnits);
                    }}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    placeholder="Sale Price"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category & Supplier */}
        <div className="bg-gradient-to-br from-white to-cyan-50/20 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">7</span>
            Category & Supplier
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category ID</label>
              <input
                type="number"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter category ID"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier ID</label>
              <input
                type="number"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter supplier ID"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Base Unit ID</label>
              <input
                type="number"
                value={formData.base_unit_id}
                onChange={(e) => setFormData({ ...formData, base_unit_id: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter base unit ID"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-4 justify-end">
          <Link
            to="/products"
            className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
