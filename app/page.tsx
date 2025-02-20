"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Pokemon = {
  name: string;
  url: string;
};

const types = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "psychic", "rock", "ghost", "dragon", "dark", "steel", "fairy"];


export default function Home() {
  const [allPokemonList, setAllPokemonList] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const limit = 20;

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
    }

    fetchPokemon();
  }, [offset, selectedType]);

  // フィルタリングされたポケモンリスト
  const displayedPokemonList = showFavoritesOnly
    ? allPokemonList.filter(pokemon => favorites.includes(Number(pokemon.url.split("/").slice(-2, -1)[0])))
    : allPokemonList;

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

      {/* ポケモンリスト */}
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {displayedPokemonList.map((pokemon, index) => {
          const pokemonId = pokemon.url.split("/").slice(-2, -1)[0];
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

      {/* 「もっと見る」ボタン（無限スクロール風） */}
      {!showFavoritesOnly && (
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
