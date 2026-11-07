import { ContactCollectionListItem } from './ContactCollectionListItem'

export function ContactCollectionList({ items, timezone }) {
  return (
    <ul className="divide-y divide-separator" role="list">
      {items.map((item) => (
        <ContactCollectionListItem item={item} key={item.id} timezone={timezone} />
      ))}
    </ul>
  )
}
