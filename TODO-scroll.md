# Scroll-to-Top Implementation

## Status
✅ **1**. Create `src/components/shared/ScrollToTop.jsx` - Global auto-scroll on route change (smooth)

✅ **2**. Edit `src/App.jsx`:
   * Import ScrollToTop
   * Add `<ScrollToTop />` inside Router (post-Routes)

## Test (dev server running)
1. Navigate / → /cart → /product/1 → /
2. Auto-scrolls to top smoothly on each route change ✅
3. ProductDetail local scroll preserved

**Complete!**
