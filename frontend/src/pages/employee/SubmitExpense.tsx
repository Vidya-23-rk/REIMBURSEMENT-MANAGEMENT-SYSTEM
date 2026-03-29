import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Loader2,
  Calendar,
  FileText,
  Tag,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react';
import { expensesApi } from '../../api/expenses.api';
import { useCurrency } from '../../hooks/useCurrency';
import CurrencyInput from '../../components/CurrencyInput';
import OCRUploader from '../../components/OCRUploader';
import type { OCRResult } from '../../types';
import { EXPENSE_CATEGORIES } from '../../types';
import toast from 'react-hot-toast';

export default function SubmitExpense() {
  const navigate = useNavigate();
  const { currencies, convert } = useCurrency();

  const [activeTab, setActiveTab] = useState<'new' | 'upload'>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    category: '',
    paidBy: 'Self',
    amount: 0,
    currency: 'INR',
    remarks: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const convertedAmount = form.currency !== 'INR' ? convert(form.amount, form.currency, 'INR') : form.amount;

  const handleOCRResult = (result: OCRResult) => {
    setForm({
      ...form,
      description: result.description || `${result.vendor} - receipt`,
      expenseDate: result.date || form.expenseDate,
      category: result.category || form.category,
      amount: result.amount,
      currency: result.currency || form.currency,
    });
    setActiveTab('new');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.expenseDate) errs.expenseDate = 'Date is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.amount || form.amount <= 0) errs.amount = 'Enter a valid amount';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await expensesApi.createExpense({
        description: form.description,
        expenseDate: form.expenseDate,
        category: form.category,
        amount: form.amount,
        currency: form.currency,
      });
      toast.success('Expense submitted successfully!');
      navigate('/expenses');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-surface-100 text-surface-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Submit Expense</h1>
          <p className="page-subtitle">Create a new expense reimbursement request</p>
        </div>
      </div>

      {/* Tabs: Upload / New — matching wireframe */}
      <div className="flex gap-1 mb-6 p-1 bg-surface-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'upload'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
          }`}
        >
          Upload Receipt
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'new'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {/* OCR Upload tab */}
      {activeTab === 'upload' && (
        <div className="card p-6 mb-6 animate-fade-in">
          <h3 className="text-lg font-display font-bold text-surface-900 mb-4">
            Scan Receipt with OCR
          </h3>
          <p className="text-sm text-surface-500 mb-4">
            Upload a receipt image and our OCR will automatically extract amount, category, and description.
          </p>
          <OCRUploader onScanResult={handleOCRResult} />
        </div>
      )}

      {/* Manual entry form */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmit} className="animate-fade-in">
          <div className="card p-6 space-y-5">
            <h3 className="text-lg font-display font-bold text-surface-900 mb-2">
              Expense Details
            </h3>

            {/* Description */}
            <div>
              <label htmlFor="expense-description" className="input-label flex items-center gap-2">
                <FileText className="w-4 h-4 text-surface-400" /> Description
              </label>
              <input
                id="expense-description"
                className={`input-field ${errors.description ? 'border-danger-500' : ''}`}
                placeholder="e.g. Restaurant bill for client meeting"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
              {errors.description && <p className="mt-1 text-xs text-danger-500">{errors.description}</p>}
            </div>

            {/* Date + Category row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="expense-date" className="input-label flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-surface-400" /> Expense Date
                </label>
                <input
                  id="expense-date"
                  type="date"
                  className={`input-field ${errors.expenseDate ? 'border-danger-500' : ''}`}
                  value={form.expenseDate}
                  onChange={(e) => updateField('expenseDate', e.target.value)}
                />
                {errors.expenseDate && <p className="mt-1 text-xs text-danger-500">{errors.expenseDate}</p>}
              </div>
              <div>
                <label htmlFor="expense-category" className="input-label flex items-center gap-2">
                  <Tag className="w-4 h-4 text-surface-400" /> Category
                </label>
                <select
                  id="expense-category"
                  className={`input-field ${errors.category ? 'border-danger-500' : ''}`}
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                >
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-danger-500">{errors.category}</p>}
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label htmlFor="expense-paid-by" className="input-label flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-surface-400" /> Paid By
              </label>
              <select
                id="expense-paid-by"
                className="input-field"
                value={form.paidBy}
                onChange={(e) => updateField('paidBy', e.target.value)}
              >
                <option value="Self">Self</option>
                <option value="Company Card">Company Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Amount with Currency — matching wireframe's "Total amount > currency selection" */}
            <div>
              <label className="input-label flex items-center gap-2">
                Total Amount
              </label>
              <CurrencyInput
                amount={form.amount}
                currency={form.currency}
                currencies={currencies}
                onAmountChange={(val) => updateField('amount', val)}
                onCurrencyChange={(code) => updateField('currency', code)}
                convertedAmount={convertedAmount}
              />
              {errors.amount && <p className="mt-1 text-xs text-danger-500">{errors.amount}</p>}
            </div>

            {/* Remarks */}
            <div>
              <label htmlFor="expense-remarks" className="input-label flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-surface-400" /> Remarks
              </label>
              <textarea
                id="expense-remarks"
                className="input-field min-h-[80px] resize-none"
                placeholder="Additional notes (optional)"
                value={form.remarks}
                onChange={(e) => updateField('remarks', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Submit button — matching wireframe */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-surface-400">
              Once submitted, this expense will be sent for approval and become read-only.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-8 py-3 text-base"
              id="submit-expense-btn"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" /> Submit Expense
                </span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
