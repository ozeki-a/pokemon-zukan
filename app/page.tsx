"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Pokemon = {
  name: string;
  url: string;
};

const types = ["fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "psychic", "rock", "ghost", "dragon", "dark", "steel", "fairy"];

export default function Home() {
  const [allPokemonList, setAllPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemonList, setFilteredPokemonList] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const limit = 20;

  // API からポケモンのリストを取得
  useEffect(() => {
    async function fetchPokemon() {
      try {
        let url = `https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0`; // すべてのポケモン取得

        if (selectedType) {
          url = `https://pokeapi.co/api/v2/type/${selectedType}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (selectedType) {
          const allTypePokemon = data.pokemon.map((p: any) => p.pokemon);
          setAllPokemonList(allTypePokemon);
        } else {
          setAllPokemonList(data.results);
        }

        setOffset(0); // タイプ変更時にページをリセット
      } catch (error) {
        console.error("ポケモンデータの取得に失敗しました", error);
      }
    }

    fetchPokemon();
  }, [selectedType]);

  // ページネーションで表示するデータを更新
  useEffect(() => {
    const start = offset;
    const end = offset + limit;
    setFilteredPokemonList(allPokemonList.slice(start, end));
  }, [allPokemonList, offset]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Pokémon図鑑</h1>

      {/* タイプフィルター */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {types.map((type) => (
          <button 
            key={type} 
            onClick={() => setSelectedType(type)} 
            className={`px-4 py-2 rounded-lg ${selectedType === type ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {type.toUpperCase()}
          </button>
        ))}
        {selectedType && (
          <button 
            onClick={() => setSelectedType(null)} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            全て表示
          </button>
        )}
      </div>

      {/* ポケモンリスト */}
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {filteredPokemonList.map((pokemon, index) => {
          const pokemonId = pokemon.url.split("/").slice(-2, -1)[0];
          const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

          return (
            <li key={index} className="bg-white p-4 rounded-lg shadow-md text-center">
              <Image src={imageUrl} alt={pokemon.name} width={96} height={96} className="mx-auto" />
              <p className="capitalize font-semibold mt-2">{pokemon.name}</p>
            </li>
          );
        })}
      </ul>

      {/* ページネーション */}
      <div className="flex justify-center mt-6 gap-4">
        <button 
          onClick={() => setOffset(prev => Math.max(prev - limit, 0))} 
          disabled={offset === 0}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${offset === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
        >
          前へ
        </button>
        <button 
          onClick={() => setOffset(prev => prev + limit)} 
          disabled={offset + limit >= allPokemonList.length}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${offset + limit >= allPokemonList.length ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
        >
          次へ
        </button>
      </div>
    </div>
  );
}
