'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

function SchemesContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const [schemes, setSchemes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(searchParams.get('beneficiary') || '');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [schemesRes, catsRes] = await Promise.all([
          api.listSchemes({
            q: searchQuery || undefined,
            category: selectedCategory || undefined,
            level: selectedLevel || undefined,
            beneficiary: selectedBeneficiary || undefined
          }),
          api.getCategories()
        ]);
        setSchemes(schemesRes);
        setCategories(catsRes);
      } catch (err) {
        console.error('Error fetching schemes:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [searchQuery, selectedCategory, selectedLevel, selectedBeneficiary]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedBeneficiary('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#555555]">
          <span className="font-semibold text-[#111111] uppercase tracking-wider">Repository</span>
          <span>&bull;</span>
          <span>Karnataka & Central Public Schemes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          Government Schemes Directory
        </h1>
        <p className="text-xs sm:text-sm text-[#555555] max-w-3xl leading-relaxed">
          Search and inspect verified public welfare programs. Every entry lists official department URLs, verified eligibility criteria, and required document checklists.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-5 sm:p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scheme name, keyword, or department..."
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#111111] placeholder-[#858585] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#555555] hover:text-[#111111]"
              >
                <GovIcon name="x-mark" className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button type="submit" variant="primary" size="md">
            <GovIcon name="search" className="w-4 h-4 mr-1.5" />
            Search Catalog
          </Button>
        </form>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E5E5]">
          <span className="text-xs font-semibold text-[#555555] mr-1">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-[#111111] text-white'
                : 'bg-[#F7F7F6] text-[#111111] hover:bg-[#EEEEEC] border border-[#E5E5E5]'
            }`}
          >
            All Schemes
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === c.name
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#F7F7F6] text-[#111111] hover:bg-[#EEEEEC] border border-[#E5E5E5]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Level and Beneficiary Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Government Level:
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            >
              <option value="">All Government Levels</option>
              <option value="karnataka">Karnataka State Schemes</option>
              <option value="central">Central Government Schemes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Target Beneficiary:
            </label>
            <select
              value={selectedBeneficiary}
              onChange={(e) => setSelectedBeneficiary(e.target.value)}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            >
              <option value="">All Beneficiary Demographics</option>
              <option value="student">Students & Scholars</option>
              <option value="farmer">Farmers & Cultivators</option>
              <option value="female">Women Heads of Household</option>
              <option value="unemployed">Unemployed Degree/Diploma Holders</option>
              <option value="artisan">Artisans & Craftspeople</option>
              <option value="bpl">BPL / Ration Card Holders</option>
            </select>
          </div>
        </div>

        {(searchQuery || selectedCategory || selectedLevel || selectedBeneficiary) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] text-xs">
            <span className="text-[#555555]">Active filters applied</span>
            <button
              onClick={clearFilters}
              className="text-[#111111] font-semibold hover:underline flex items-center gap-1"
            >
              <GovIcon name="refresh" className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Directory Results */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3 text-xs">
          <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#555555]">Querying verified government scheme catalog...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-12 text-center space-y-3 text-xs">
          <GovIcon name="info" className="w-8 h-8 text-[#555555] mx-auto" />
          <h3 className="text-sm font-bold text-[#111111]">No verified schemes found</h3>
          <p className="text-[#555555] max-w-md mx-auto leading-relaxed">
            No active government schemes matched your exact filters. Try clearing your search term or selecting "All Schemes".
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemes.map((scheme) => {
            const isKarnataka = scheme.government_level === 'karnataka';
            let titleToDisplay = scheme.title;
            if (language === 'kn' && scheme.kannada_title) {
              titleToDisplay = `${scheme.title} (${scheme.kannada_title})`;
            } else if (language === 'hi' && scheme.hindi_title) {
              titleToDisplay = `${scheme.title} (${scheme.hindi_title})`;
            } else if (language === 'ur' && scheme.urdu_title) {
              titleToDisplay = `${scheme.title} (${scheme.urdu_title})`;
            }

            return (
              <div
                key={scheme.id}
                className="bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] rounded-2xl p-6 flex flex-col justify-between transition-colors space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={isKarnataka ? 'karnataka' : 'central'}>
                      {isKarnataka ? 'Karnataka Scheme' : 'Government of India'}
                    </Badge>
                    <span className="font-mono text-xs text-[#858585] font-semibold">
                      {scheme.code}
                    </span>
                  </div>

                  <div>
                    <Link href={`/schemes/${scheme.id}`}>
                      <h3 className="text-lg font-bold text-[#111111] hover:underline leading-snug">
                        {titleToDisplay}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#555555] mt-0.5">{scheme.department}</p>
                  </div>

                  <p className="text-xs text-[#555555] leading-relaxed line-clamp-3">
                    {scheme.short_description}
                  </p>

                  <div className="p-3 bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl text-xs space-y-1">
                    <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block">
                      Benefits:
                    </span>
                    <span className="text-[#555555] leading-relaxed">{scheme.benefits_summary}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#858585] pt-1">
                    <span className="flex items-center gap-1 font-medium text-[#15803D]">
                      <GovIcon name="check" className="w-3.5 h-3.5" />
                      {scheme.rules_count} Verified Rules
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <GovIcon name="document" className="w-3.5 h-3.5" />
                      {scheme.documents_count} Required Docs
                    </span>
                    <span>&bull;</span>
                    <span>
                      Audit: {scheme.last_verified_date}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <Link href={`/schemes/${scheme.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link href={`/eligibility?scheme=${scheme.id}`}>
                      <Button variant="secondary" size="sm">
                        Check Eligibility
                      </Button>
                    </Link>
                    <Link href={`/apply/${scheme.id}`}>
                      <Button variant="primary" size="sm">
                        Prepare &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SchemesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto py-20 text-center text-xs text-[#555555]">
        Loading government schemes catalog...
      </div>
    }>
      <SchemesContent />
    </Suspense>
  );
}
