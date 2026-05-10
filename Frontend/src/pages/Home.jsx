import Banner from "../components/Banner";
import Header from "../components/Header";
import SpecialityMenu from "../components/SpecialityMenu";
import SymptomChecker from "../components/SymptomChecker";
import TopDoctors from "../components/TopDoctors";

const Home = () => {
  return (
    <div>
      <Header />
      <SymptomChecker />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;
