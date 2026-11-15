export default function TextList({ items, as: Tag = 'ul' }: { items: string[]; as?: 'ol' | 'ul' }) {
  return (
    <Tag>
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </Tag>
  )
}
