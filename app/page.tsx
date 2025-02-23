"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

type Pokemon = {
  name: string;
  url: string;
};

const types = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison",
  "ground", "psychic", "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

export default function Home() {
  const [allPokemonList, setAllPokemonList] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [favoritePokemonList, setFavoritePokemonList] = useState<Pokemon[]>([]);

  // ローカルストレージからお気に入りを読み込む
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(savedFavorites);
  }, []);

  // お気に入りの追加/削除
  const toggleFavorite = (id: number) => {
    let updatedFavorites;
    if (favorites.includes(id)) {
      updatedFavorites = favorites.filter(favId => favId !== id);
    } else {
      updatedFavorites = [...favorites, id];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // API からポケモンのリストを取得
  useEffect(() => {
    async function fetchPokemon() {
      setLoading(true); // データ取得前にローディングをON
      try {
        let url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

        if (selectedType) {
          url = `https://pokeapi.co/api/v2/type/${selectedType}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (selectedType) {
          const newPokemonList = data.pokemon.map((p: any) => p.pokemon);
          setAllPokemonList(newPokemonList); // タイプ変更時はリストをリセット
        } else {
          setAllPokemonList(prev => [...prev, ...data.results]); // 追加読み込み形式
        }
      } catch (error) {
        console.error("ポケモンデータの取得に失敗しました", error);
      }
      setLoading(false); // データ取得が終わったらローディングをOFF
    }

    fetchPokemon();
  }, [offset, selectedType]);

  // お気に入りポケモンの詳細データを取得
  useEffect(() => {
    async function fetchFavoritePokemon() {
      if (!showFavoritesOnly || favorites.length === 0) return;
  
      try {
        const favoriteData = await Promise.all(
          favorites.map(async (favId) => {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${favId}`);
  
            // ❗ APIリクエストが失敗した場合は null を返す
            if (!res.ok) return null;
  
            return await res.json();
          })
        );
  
        // ❗ null のデータを除外してセット
        setFavoritePokemonList(favoriteData.filter(pokemon => pokemon !== null));
      } catch (error) {
        console.error("お気に入りポケモンの取得に失敗しました", error);
      }
    }
  
    fetchFavoritePokemon();
  }, [showFavoritesOnly, favorites]); // お気に入りが変更されたら更新

  // useMemo で最適化
  const displayedPokemonList = useMemo(() => {
    return showFavoritesOnly ? favoritePokemonList : allPokemonList;
  }, [allPokemonList, favoritePokemonList, showFavoritesOnly]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Pokémon図鑑</h1>

      {/* タイプフィルター */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {types.map((type) => (
          <button 
            key={type} 
            onClick={() => {
              setSelectedType(type);
              setOffset(0); // タイプを変更したらリセット
              setAllPokemonList([]); // 新しいリストを取得
            }} 
            className={`px-4 py-2 rounded-lg ${selectedType === type ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {type.toUpperCase()}
          </button>
        ))}
        {selectedType && (
          <button 
            onClick={() => {
              setSelectedType(null);
              setOffset(0);
              setAllPokemonList([]);
            }} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            全て表示
          </button>
        )}
      </div>

      {/* お気に入りフィルター */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowFavoritesOnly(prev => !prev)}
          className={`px-4 py-2 rounded-lg ${showFavoritesOnly ? "bg-yellow-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          {showFavoritesOnly ? "すべてのポケモンを表示" : "お気に入りのみ表示"}
        </button>
      </div>

      {/* ローディング表示 */}
      {loading ? (
        <p className="text-center text-gray-500">ポケモンを読み込み中...</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {displayedPokemonList.map((pokemon, index) => {
          // pokemon.url がある場合は URL からIDを取得、ない場合は直接 pokemon.id を使用
          const pokemonId = pokemon.url ? pokemon.url.split("/").slice(-2, -1)[0] : pokemon.id;
          const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

          return (
            <li key={index} className="bg-white p-4 rounded-lg shadow-md text-center relative hover:bg-gray-200 transition">
              {/* お気に入りボタン */}
              <button 
                onClick={() => toggleFavorite(Number(pokemonId))}
                className={`absolute top-2 right-2 text-xl ${
                  favorites.includes(Number(pokemonId)) ? "text-yellow-500" : "text-gray-400"
                }`}
              >
                {favorites.includes(Number(pokemonId)) ? "★" : "☆"}
              </button>

              <Link href={`/pokemon/${pokemonId}`} className="block">
                <Image src={imageUrl} alt={pokemon.name} width={96} height={96} className="mx-auto" />
                <p className="capitalize font-semibold mt-2">{pokemon.name}</p>
              </Link>
            </li>
          );
        })}
        </ul>
      )}

      {/* 「もっと見る」ボタン */}
      {!showFavoritesOnly && !loading && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => setOffset(prev => prev + limit)} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
}
