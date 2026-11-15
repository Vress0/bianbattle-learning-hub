export default function PageHeading({ title, summary }: { title: string; summary: string }) {
  return (
    <header className="page-heading">
      <h1>{title}</h1>
      <p>{summary}</p>
    </header>
  )
}
