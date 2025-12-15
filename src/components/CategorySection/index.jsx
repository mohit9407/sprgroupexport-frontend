import CategoryCard from '../CategoryCard'

const CategorySection = () => {
  const categories = [
    {
      id: 'women',
      title: 'WOMEN',
      image: '/bg1.jpg',
      href: '/women',
    },
    {
      id: 'men1',
      title: 'MENS',
      image: '/bg2.jpg',
      href: '/men',
    },
    {
      id: 'men2',
      title: 'MENS',
      image: '/bg2.jpg',
      href: '/men',
    },
    {
      id: 'men3',
      title: 'MENS',
      image: '/bg2.jpg',
      href: '/men',
    },
  ]

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-3xl font-bold text-center mb-12 uppercase tracking-wider text-gray-800">
        PRODUCT CATEGORIES
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="w-full">
              <CategoryCard
                title={category.title}
                imageUrl={category.image}
                href={category.href}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection
