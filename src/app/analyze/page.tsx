'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface AnalysisResult {
  predictedDish: string;
  confidence: number;
  ingredients: Array<{
    name: string;
    amount: string;
    unitCost: number;
    totalCost: number;
  }>;
  estimatedCost: {
    ingredients: number;
    labor: number;
    packaging: number;
    overhead: number;
    total: number;
  };
  suggestedPrice: {
    min: number;
    optimal: number;
    max: number;
  };
  marginRate: number;
  processSteps: Array<{
    step: number;
    name: string;
    duration: string;
    equipment: string[];
  }>;
  matchedRecipes: Array<{
    id: string;
    name: string;
    similarity: number;
    category: string;
  }>;
  optimizations: string[];
  riskFactors: string[];
}

type AnalysisStep = 'upload' | 'analyzing' | 'result';

export default function AnalyzePage() {
  const [step, setStep] = useState<AnalysisStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const startAnalysis = async () => {
    if (!uploadedFile) return;

    setStep('analyzing');
    setAnalysisProgress(0);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('분석 중 오류가 발생했습니다');
      }

      const result = await response.json();
      setAnalysisProgress(100);
      
      setTimeout(() => {
        setAnalysisResult(result.data);
        setStep('result');
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다');
      setStep('upload');
    }
  };

  const resetAnalysis = () => {
    setStep('upload');
    setUploadedImage(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setAnalysisProgress(0);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-6">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            ← 홈으로
          </Link>
          <h1 className="text-4xl font-bold mb-4">AI 레시피 분석</h1>
          <p className="text-xl text-white/80">
            사진 한 장으로 원가, 공정, 마진율까지 자동 분석
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Upload Step */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div
                {...getRootProps()}
                className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-primary hover:bg-gray-100'
                }`}
              >
                <input {...getInputProps()} />
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImage}
                      alt="업로드된 이미지"
                      className="max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <p className="text-gray-600">
                      다른 이미지를 업로드하려면 클릭하거나 드래그하세요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-4xl">
                      📷
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        레시피 사진을 업로드하세요
                      </p>
                      <p className="text-gray-500 mt-2">
                        클릭하거나 이미지를 드래그하세요 (최대 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}

              {uploadedImage && (
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={resetAnalysis}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    다시 선택
                  </button>
                  <button
                    onClick={startAnalysis}
                    className="btn-primary px-8 py-3 rounded-xl"
                  >
                    AI 분석 시작
                  </button>
                </div>
              )}

              {/* Sample Images */}
              <div className="mt-12">
                <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
                  또는 샘플 이미지로 체험해보세요
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {['라멘', '파스타', '비빔밥'].map((dish, index) => (
                    <button
                      key={index}
                      className="aspect-square bg-gray-200 rounded-xl hover:ring-2 ring-primary transition-all flex items-center justify-center text-4xl"
                    >
                      {['🍜', '🍝', '🍚'][index]}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Analyzing Step */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-white rounded-2xl p-12 shadow-lg">
                <div className="w-32 h-32 mx-auto mb-8 relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full"
                  />
                  <div className="absolute inset-4 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                    🔬
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  AI가 레시피를 분석하고 있습니다
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-primary-light"
                      initial={{ width: 0 }}
                      animate={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <p className="text-gray-600">
                    {analysisProgress < 30 && '이미지 인식 중...'}
                    {analysisProgress >= 30 && analysisProgress < 60 && '재료 분석 중...'}
                    {analysisProgress >= 60 && analysisProgress < 80 && '원가 계산 중...'}
                    {analysisProgress >= 80 && '최적화 방안 도출 중...'}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { icon: '🔍', label: '이미지 인식', done: analysisProgress >= 30 },
                    { icon: '🥬', label: '재료 분석', done: analysisProgress >= 60 },
                    { icon: '💰', label: '원가 계산', done: analysisProgress >= 80 },
                    { icon: '✨', label: '최적화', done: analysisProgress >= 95 },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl ${
                        item.done ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Result Step */}
          {step === 'result' && analysisResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Result Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {analysisResult.predictedDish}
                  </h2>
                  <p className="text-gray-600">
                    분석 신뢰도: {(analysisResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100"
                >
                  새로운 분석
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Cost Breakdown */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">원가 분석</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: '재료비', value: analysisResult.estimatedCost.ingredients, color: 'bg-blue-500' },
                        { label: '인건비', value: analysisResult.estimatedCost.labor, color: 'bg-green-500' },
                        { label: '포장비', value: analysisResult.estimatedCost.packaging, color: 'bg-yellow-500' },
                        { label: '간접비', value: analysisResult.estimatedCost.overhead, color: 'bg-purple-500' },
                      ].map((item, index) => (
                        <div key={index} className="text-center">
                          <div className={`w-12 h-12 mx-auto ${item.color} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                            {Math.round((item.value / analysisResult.estimatedCost.total) * 100)}%
                          </div>
                          <div className="font-medium text-gray-900">₩{item.value.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 flex justify-between items-center">
                      <span className="font-medium text-gray-700">총 예상 원가</span>
                      <span className="text-2xl font-bold text-primary">
                        ₩{analysisResult.estimatedCost.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">재료 분석</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 text-gray-600">재료명</th>
                            <th className="text-left py-3 text-gray-600">용량</th>
                            <th className="text-right py-3 text-gray-600">단가</th>
                            <th className="text-right py-3 text-gray-600">금액</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.ingredients.map((ingredient, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="py-3 font-medium">{ingredient.name}</td>
                              <td className="py-3 text-gray-600">{ingredient.amount}</td>
                              <td className="py-3 text-right text-gray-600">
                                ₩{ingredient.unitCost.toLocaleString()}
                              </td>
                              <td className="py-3 text-right font-medium">
                                ₩{ingredient.totalCost.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Process Steps */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">공정 분석</h3>
                    <div className="space-y-4">
                      {analysisResult.processSteps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900">{step.name}</h4>
                              <span className="text-sm text-gray-500">{step.duration}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {step.equipment.map((eq, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-white text-gray-600 text-xs rounded-full border"
                                >
                                  {eq}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Pricing */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">권장 판매가</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">최소가</span>
                        <span className="font-medium">₩{analysisResult.suggestedPrice.min.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border-2 border-primary">
                        <span className="text-primary font-medium">최적가</span>
                        <span className="text-xl font-bold text-primary">
                          ₩{analysisResult.suggestedPrice.optimal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">최대가</span>
                        <span className="font-medium">₩{analysisResult.suggestedPrice.max.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-green-50 rounded-xl text-center">
                      <div className="text-sm text-green-600 mb-1">예상 마진율</div>
                      <div className="text-3xl font-bold text-green-600">
                        {(analysisResult.marginRate * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Matched Recipes */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">유사 레시피</h3>
                    <div className="space-y-3">
                      {analysisResult.matchedRecipes.map((recipe, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{recipe.name}</div>
                            <div className="text-sm text-gray-500">{recipe.category}</div>
                          </div>
                          <div className="text-primary font-medium">
                            {(recipe.similarity * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optimizations */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">최적화 제안</h3>
                    <ul className="space-y-2">
                      {analysisResult.optimizations.map((opt, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-gray-600">{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risk Factors */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">리스크 요인</h3>
                    <ul className="space-y-2">
                      {analysisResult.riskFactors.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-yellow-500 mt-0.5">⚠</span>
                          <span className="text-gray-600">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white text-center">
                    <h3 className="text-xl font-bold mb-2">상품화를 시작하세요</h3>
                    <p className="text-white/80 text-sm mb-4">
                      전문 컨설턴트가 맞춤 로드맵을 제안해드립니다
                    </p>
                    <Link
                      href="/consultation"
                      className="block w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-all"
                    >
                      무료 상담 신청
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
