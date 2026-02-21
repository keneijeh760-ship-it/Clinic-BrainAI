import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Star, Users, Heart } from "lucide-react";

const leaders = [
  { rank: 1, name: "Amina Bello", lga: "Ikeja, Lagos", patients: 47, points: 235 },
  { rank: 2, name: "Emeka Okonkwo", lga: "Enugu South", patients: 42, points: 210 },
  { rank: 3, name: "Fatima Abdullahi", lga: "Kano Municipal", patients: 38, points: 190 },
  { rank: 4, name: "Chidi Nwosu", lga: "Owerri West", patients: 35, points: 175 },
  { rank: 5, name: "Adebayo Ogunleye", lga: "Ibadan North", patients: 31, points: 155 },
  { rank: 6, name: "Hauwa Musa", lga: "Maiduguri Metro", patients: 28, points: 140 },
  { rank: 7, name: "Ngozi Eze", lga: "Abakaliki", patients: 25, points: 125 },
  { rank: 8, name: "Yusuf Ibrahim", lga: "Kaduna North", patients: 22, points: 110 },
];

const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-accent/20 border-accent/40";
  if (rank === 2) return "bg-secondary border-border";
  if (rank === 3) return "bg-secondary border-border";
  return "bg-card border-border";
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-6 h-6 text-accent" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-muted-foreground" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
};

const Leaderboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="hero-gradient px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary-foreground" />
              <span className="font-bold text-primary-foreground">CHEWLink</span>
            </div>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 text-primary-foreground mx-auto mb-2" />
            <h1 className="text-xl font-bold text-primary-foreground">Top Health Workers</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">This Month's Champions</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-6 pb-8">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {leaders.slice(0, 3).map((l) => (
            <div
              key={l.rank}
              className={`rounded-xl p-3 text-center border-2 card-shadow animate-scale-in ${getRankStyle(l.rank)} ${
                l.rank === 1 ? "transform scale-105" : ""
              }`}
            >
              <div className="flex justify-center mb-2">{getRankIcon(l.rank)}</div>
              <div className="w-10 h-10 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-sm font-bold text-primary mb-1">
                {l.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <p className="text-xs font-semibold text-foreground truncate">{l.name.split(" ")[0]}</p>
              <p className="text-lg font-bold text-primary">{l.points}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          ))}
        </div>

        {/* Full List */}
        <div className="space-y-2">
          {leaders.map((l) => (
            <div
              key={l.rank}
              className={`flex items-center gap-3 rounded-xl p-3 border card-shadow ${getRankStyle(l.rank)}`}
            >
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {getRankIcon(l.rank)}
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {l.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.lga}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-primary">{l.points} pts</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Users className="w-3 h-3" /> {l.patients}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
