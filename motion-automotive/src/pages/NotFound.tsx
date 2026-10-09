import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-start py-24">
      <h1 className="text-4xl font-semibold tracking-tighter">We could not find that page</h1>
      <p className="mt-3 text-muted-foreground">The car or booking may have been removed.</p>
      <Link to="/fleet" className="btn-solid mt-8">Back to the fleet</Link>
    </div>
  )
}
