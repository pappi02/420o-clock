import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { products, categories, effects } from '../../data/products.js';
import './Sidebar.css';

// -------------------------------------------------------------------
// Helper Components
// -------------------------------------------------------------------

const SectionToggle = ({ title, count, expanded, onClick }) => (
  <button className="section-toggle" onClick={onClick}>
    <span>
      {title}
      {count !== undefined && ` (${count})`}
    </span>
    <svg className={`chevron ${expanded ? 'open' : ''}`} viewBox="0 0 24 24">
      <path fill="currentColor" d="M7 10l5 5 5-5z" />
    </svg>
  </button>
);

const FilterList = ({ items, type, selected, onChange }) => (
  <div className="filter-list">
    {items.map(item => (
      <label key={item.id} className="filter-option">
        <input
          type={type === 'category' ? 'radio' : 'checkbox'}
          name={type}
          checked={type === 'category' 
            ? selected === (item.id === 'all' ? null : item.id)
            : (selected || []).includes(item.id)}
          onChange={() => onChange(item.id)}
        />
        <span className="filter-label">{item.name}</span>
        <span className="filter-count">({item.count})</span>
      </label>
    ))}
  </div>
);

const RangeFilter = ({ label, min, max, values, onUpdate }) => (
  <div className="range-filter">
    <div className="range-slider">
      <div className="range-track" />
      <input
        type="range"
        className="range-input"
        min={min}
        max={max}
        value={values.min}
        onChange={e => onUpdate('min', Number(e.target.value))}
      />
      <input
        type="range"
        className="range-input"
        min={min}
        max={max}
        value={values.max}
        onChange={e => onUpdate('max', Number(e.target.value))}
      />
    </div>
    <div className="range-values">
      <span>{label} {values.min}</span>
      <span>{label} {values.max}</span>
    </div>
  </div>
);

// -------------------------------------------------------------------
// Main Sidebar Component
// -------------------------------------------------------------------

const Sidebar = ({ isOpen, onClose, filters, onFilterChange }) => {
  // Section expand state
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    effects: false,
    price: false,
    thc: false
  });

  // Temporary slider values (live update)
  const [tempFilters, setTempFilters] = useState({
    priceMin: 50,
    priceMax: 5000,
    thcMin: 10,
    thcMax: 35
  });

  // Sync with props filters
  useEffect(() => {
    setTempFilters({
      priceMin: filters.priceMin ?? 50,
      priceMax: filters.priceMax ?? 5000,
      thcMin: filters.thcMin ?? 10,
      thcMax: filters.thcMax ?? 35
    });
  }, [filters]);

  // Available categories & effects
  const availableCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return categories.filter(cat => cats.includes(cat.id) || cat.id === 'all');
  }, []);

  const availableEffects = useMemo(() => 
    effects.filter(eff => products.some(p => p.effects?.includes(eff.id)))
  , []);

  // Toggle section
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Category change
  const handleCategoryChange = useCallback((catId) => {
    onFilterChange({ category: catId === 'all' ? null : catId });
  }, [onFilterChange]);

  // Effect change
  const handleEffectChange = useCallback((effectId) => {
    const current = filters.effects || [];
    const newEffects = current.includes(effectId)
      ? current.filter(id => id !== effectId)
      : [...current, effectId];
    onFilterChange({ effects: newEffects.length ? newEffects : null });
  }, [filters.effects, onFilterChange]);

  // Slider updates (debounced)
  const updateSlider = useCallback((type, value) => {
    setTempFilters(prev => {
      const updated = { ...prev, [type]: value };
      // Debounce the actual filter update
      clearTimeout(window.sliderTimeout);
      window.sliderTimeout = setTimeout(() => {
        const changes = {};
        if (type.startsWith('price')) {
          changes.priceMin = updated.priceMin;
          changes.priceMax = updated.priceMax;
        } else if (type.startsWith('thc')) {
          changes.thcMin = updated.thcMin;
          changes.thcMax = updated.thcMax;
        }
        if (Object.keys(changes).length) onFilterChange(changes);
      }, 150);
      return updated;
    });
  }, [onFilterChange]);

  // Clear all filters
  const clearAll = useCallback(() => {
    onFilterChange({});
    setTempFilters({ priceMin: 50, priceMax: 5000, thcMin: 10, thcMax: 35 });
  }, [onFilterChange]);

  // Mobile close overlay
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  // Apply button (only closes mobile, but kept for consistency)
  const applyFilters = useCallback(() => {
    if (isOpen) onClose();
  }, [onClose, isOpen]);

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={handleOverlayClick}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h3 className="sidebar-title">Filters</h3>
          <button className="clear-all-btn" onClick={clearAll}>
            Clear All
          </button>
        </div>

        {/* Delivery Info */}
        <div className="delivery-info">
          <div className="delivery-badge">
            <span className="delivery-icon">🚚</span>
            <span>20 min delivery</span>
          </div>
          <div className="delivery-time">Order before cutoff</div>
        </div>

        {/* Filter Sections */}
        <div className="sidebar-sections">
          {/* Bestsellers Section */}
          <button className="section-toggle bestseller-toggle" onClick={() => onFilterChange({bestseller: true})}>
            <span>🔥 Bestsellers</span>
          </button>
          
          {/* Category Section */}
          <SectionToggle
            title="Categories"
            count={availableCategories.length - 1}
            expanded={expandedSections.category}
            onClick={() => toggleSection('category')}
          />
          {expandedSections.category && (
            <FilterList
              items={availableCategories}
              type="category"
              selected={filters.category}
              onChange={handleCategoryChange}
            />
          )}

          {/* Effects Section */}
          <SectionToggle
            title="Effects"
            count={availableEffects.length}
            expanded={expandedSections.effects}
            onClick={() => toggleSection('effects')}
          />
          {expandedSections.effects && (
            <FilterList
              items={availableEffects}
              type="effects"
              selected={filters.effects}
              onChange={handleEffectChange}
            />
          )}

          {/* Price Range Section */}
          <SectionToggle
            title={`Price KES ${tempFilters.priceMin} - ${tempFilters.priceMax}`}
            expanded={expandedSections.price}
            onClick={() => toggleSection('price')}
          />
          {expandedSections.price && (
            <RangeFilter
              label="KES"
              min={50}
              max={5000}
              values={{ min: tempFilters.priceMin, max: tempFilters.priceMax }}
              onUpdate={(which, val) => updateSlider(`price${which === 'min' ? 'Min' : 'Max'}`, val)}
            />
          )}

          {/* THC Range Section */}
          <SectionToggle
            title={`THC ${tempFilters.thcMin}% - ${tempFilters.thcMax}%`}
            expanded={expandedSections.thc}
            onClick={() => toggleSection('thc')}
          />
          {expandedSections.thc && (
            <RangeFilter
              label="%"
              min={10}
              max={35}
              values={{ min: tempFilters.thcMin, max: tempFilters.thcMax }}
              onUpdate={(which, val) => updateSlider(`thc${which === 'min' ? 'Min' : 'Max'}`, val)}
            />
          )}
        </div>

        {/* Footer Button */}
        <div className="sidebar-footer">
          <button className="apply-btn" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;