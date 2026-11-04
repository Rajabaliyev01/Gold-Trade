import React, { useState } from 'react';
import { JewelryPipelineHub } from '../components/production/JewelryPipelineHub';
import { NewOrderModal } from '../components/production/NewOrderModal';
import { Sparkles, Layers, ShieldCheck, ArrowRight, Boxes } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JewelryPipelinePage() {
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gold-400 mb-1 font-semibold">
            <Link to="/production" className="hover:underline flex items-center space-x-1">
              <span>Ishlab Chiqarish</span>
            </Link>
            <span>/</span>
            <span className="text-slate-400">5 Bosqichli Sanoat Tizimi</span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <span>5 Bosqichli Zargarlik Ishlab Chiqarish Tizimi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Xomashyo kirimidan tortib eritish, usta buyurtmalari, sifat nazorati (QC) va tayyor birkagacha bo'lgan to'liq sanoat zanjiri
          </p>
        </div>

        <Link
          to="/production"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-slate-300 border border-luxury-border text-xs font-semibold transition-all self-start sm:self-center"
        >
          <span>Buyurtmalar ro'yxatiga o'tish</span>
          <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
        </Link>
      </div>

      {/* Main 5-Stage Jewelry Hub (Always expanded and interactive on this page) */}
      <div className="rounded-2xl">
        <JewelryPipelineHub
          onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          isOpen={true}
          onToggle={() => {}}
        />
      </div>

      {/* Modal for creating a new order directly from Job Card stage */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
      />
    </div>
  );
}
