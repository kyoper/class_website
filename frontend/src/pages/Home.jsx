import Hero from '../components/home/Hero';
import ClassStats from '../components/home/ClassStats';
import LatestAnnouncements from '../components/home/LatestAnnouncements';
import GalleryPreview from '../components/home/GalleryPreview';
import QuickLinks from '../components/home/QuickLinks';

function Home() {
  return (
    <div>
      <Hero />
      <ClassStats />
      <LatestAnnouncements />
      <GalleryPreview />
      <QuickLinks />
    </div>
  );
}

export default Home;
