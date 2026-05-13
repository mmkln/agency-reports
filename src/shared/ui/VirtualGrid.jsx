import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function getScrollParent(element) {
  if (!element) {
    return window
  }

  let parent = element.parentElement
  while (parent) {
    const style = window.getComputedStyle(parent)
    const canScroll = /(auto|scroll|overlay)/.test(`${style.overflow}${style.overflowY}`)

    if (canScroll && parent.scrollHeight > parent.clientHeight) {
      return parent
    }

    parent = parent.parentElement
  }

  return window
}

function getColumnCount(width) {
  if (width >= 1024) return 4
  if (width >= 768) return 3
  if (width >= 640) return 2
  return 1
}

function getRootRect(root) {
  if (root instanceof Window) {
    return {
      bottom: root.innerHeight,
      height: root.innerHeight,
      top: 0,
    }
  }

  const rect = root.getBoundingClientRect()
  return {
    bottom: rect.bottom,
    height: rect.height,
    top: rect.top,
  }
}

export function VirtualGrid({
  className = '',
  estimateItemHeight,
  gap = 16,
  getKey,
  items,
  overscanRows = 2,
  renderItem,
}) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [visibleRange, setVisibleRange] = useState({
    endRow: 8,
    startRow: 0,
  })

  const columnCount = getColumnCount(containerWidth)
  const rowCount = Math.ceil(items.length / columnCount)
  const rowStride = estimateItemHeight + gap
  const totalHeight = rowCount === 0
    ? 0
    : rowCount * estimateItemHeight + (rowCount - 1) * gap
  const columnWidth = columnCount > 0
    ? (containerWidth - gap * (columnCount - 1)) / columnCount
    : containerWidth

  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const scrollRoot = getScrollParent(container)
    const rootRect = getRootRect(scrollRoot)
    const containerRect = container.getBoundingClientRect()
    const visibleTop = rootRect.top - containerRect.top
    const visibleBottom = rootRect.bottom - containerRect.top
    const nextStartRow = Math.max(0, Math.floor(visibleTop / rowStride) - overscanRows)
    const nextEndRow = Math.min(rowCount, Math.ceil(visibleBottom / rowStride) + overscanRows)

    setVisibleRange((current) => (
      current.startRow === nextStartRow && current.endRow === nextEndRow
        ? current
        : { endRow: nextEndRow, startRow: nextStartRow }
    ))
  }, [overscanRows, rowCount, rowStride])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scrollRoot = getScrollParent(container)
    updateVisibleRange()
    scrollRoot.addEventListener('scroll', updateVisibleRange, { passive: true })
    window.addEventListener('resize', updateVisibleRange)

    return () => {
      scrollRoot.removeEventListener('scroll', updateVisibleRange)
      window.removeEventListener('resize', updateVisibleRange)
    }
  }, [updateVisibleRange])

  useEffect(() => {
    updateVisibleRange()
  }, [containerWidth, items.length, updateVisibleRange])

  const visibleItems = useMemo(() => {
    const startIndex = visibleRange.startRow * columnCount
    const endIndex = Math.min(items.length, visibleRange.endRow * columnCount)

    return items.slice(startIndex, endIndex).map((item, offset) => {
      const index = startIndex + offset
      const row = Math.floor(index / columnCount)
      const column = index % columnCount

      return {
        item,
        key: getKey(item),
        left: column * (columnWidth + gap),
        top: row * rowStride,
      }
    })
  }, [
    columnCount,
    columnWidth,
    gap,
    getKey,
    items,
    rowStride,
    visibleRange.endRow,
    visibleRange.startRow,
  ])

  return (
    <div className={className} ref={containerRef}>
      <div className="relative w-full" style={{ height: totalHeight }}>
        {visibleItems.map(({ item, key, left, top }) => (
          <div
            className="absolute"
            key={key}
            style={{
              height: estimateItemHeight,
              left,
              top,
              width: columnWidth,
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  )
}
