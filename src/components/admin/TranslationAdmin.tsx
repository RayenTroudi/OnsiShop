'use client';

import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from '@/contexts/TranslationContext';
import type { Language } from '@/types/translation';
import { useEffect, useState } from 'react';

interface TranslationItem {
  key: string;
  fr: string;
  en: string;
  ar: string;
}

export default function TranslationAdmin() {
  const { t, language } = useTranslation();
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newTranslations, setNewTranslations] = useState({
    fr: '',
    en: '',
    ar: ''
  });

  useEffect(() => {
    fetchAllTranslations();
  }, []);

  const fetchAllTranslations = async () => {
    setLoading(true);
    try {
      // Fetch translations for all languages
      const [frResponse, enResponse, arResponse] = await Promise.all([
        fetch('/api/translations?language=fr'),
        fetch('/api/translations?language=en'),
        fetch('/api/translations?language=ar')
      ]);

      const [frData, enData, arData] = await Promise.all([
        frResponse.json(),
        enResponse.json(),
        arResponse.json()
      ]);

      // Combine all keys from all languages
      const allKeys = new Set([
        ...Object.keys(frData),
        ...Object.keys(enData),
        ...Object.keys(arData)
      ]);

      const translationItems: TranslationItem[] = Array.from(allKeys).map(key => ({
        key,
        fr: frData[key] || '',
        en: enData[key] || '',
        ar: arData[key] || ''
      }));

      setTranslations(translationItems);
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (index: number, language: Language, value: string) => {
    const updatedTranslations = translations.map((item, i) => {
      if (i === index) {
        return { ...item, [language]: value };
      }
      return item;
    });
    setTranslations(updatedTranslations);
  };

  const saveTranslations = async () => {
    setSaving(true);
    try {
      const translationUpdates: Array<{ key: string; language: Language; text: string }> = [];

      translations.forEach(item => {
        (['fr', 'en', 'ar'] as Language[]).forEach(lang => {
          if (item[lang].trim()) {
            translationUpdates.push({
              key: item.key,
              language: lang,
              text: item[lang]
            });
          }
        });
      });

      const response = await fetch('/api/translations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ translations: translationUpdates }),
      });

      if (response.ok) {
        alert('Translations saved successfully!');
        fetchAllTranslations();
      } else {
        throw new Error('Failed to save translations');
      }
    } catch (error) {
      console.error('Error saving translations:', error);
      alert('Error saving translations');
    } finally {
      setSaving(false);
    }
  };

  const addNewTranslation = async () => {
    if (!newKey.trim()) {
      alert('Please enter a translation key');
      return;
    }

    if (translations.some(t => t.key === newKey)) {
      alert('Translation key already exists');
      return;
    }

    const newItem: TranslationItem = {
      key: newKey,
      fr: newTranslations.fr,
      en: newTranslations.en,
      ar: newTranslations.ar
    };

    setTranslations([...translations, newItem]);
    setNewKey('');
    setNewTranslations({ fr: '', en: '', ar: '' });
  };

  const deleteTranslation = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the translation key "${key}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/translations?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTranslations(translations.filter(t => t.key !== key));
        alert('Translation deleted successfully!');
      } else {
        throw new Error('Failed to delete translation');
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
      alert('Error deleting translation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Translation Management</h1>
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <button
            onClick={saveTranslations}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Add New Translation */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Translation</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Translation Key
            </label>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., welcome_message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              French 🇫🇷
            </label>
            <input
              type="text"
              value={newTranslations.fr}
              onChange={(e) => setNewTranslations({ ...newTranslations, fr: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English 🇺🇸
            </label>
            <input
              type="text"
              value={newTranslations.en}
              onChange={(e) => setNewTranslations({ ...newTranslations, en: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arabic 🇸🇦
            </label>
            <input
              type="text"
              value={newTranslations.ar}
              onChange={(e) => setNewTranslations({ ...newTranslations, ar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              dir="rtl"
            />
          </div>
        </div>
        <button
          onClick={addNewTranslation}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add Translation
        </button>
      </div>

      {/* Existing Translations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Existing Translations ({translations.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  French 🇫🇷
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  English 🇺🇸
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arabic 🇸🇦
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {translations.map((translation, index) => (
                <tr key={translation.key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {translation.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={translation.fr}
                      onChange={(e) => handleTranslationChange(index, 'fr', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={translation.en}
                      onChange={(e) => handleTranslationChange(index, 'en', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={translation.ar}
                      onChange={(e) => handleTranslationChange(index, 'ar', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      dir="rtl"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => deleteTranslation(translation.key)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
