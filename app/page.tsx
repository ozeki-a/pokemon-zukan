"use client";
import { useEffect, useState } from "react";
import Image from "next/image"; // Next.jsの画像最適化機能

type Pokemon = {
  name: string;
  url: string;
};

export default function Home() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

  useEffect(() => {
    async function fetchPokemon() {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20&offset=0");
        const data = await response.json();
        setPokemonList(data.results);
      } catch (error) {
        console.error("ポケモンデータの取得に失敗しました", error);
      }
    }

    fetchPokemon();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Pokémon図鑑</h1>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {pokemonList.map((pokemon, index) => {
          // URLの末尾のIDを取得（例: https://pokeapi.co/api/v2/pokemon/25/ → 25）
          const pokemonId = pokemon.url.split("/").slice(-2, -1)[0];
          const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

          return (
            <li key={index} className="bg-white p-4 rounded-lg shadow-md text-center">
              <Image 
                src={imageUrl} 
                alt={pokemon.name} 
                width={96} 
                height={96} 
                className="mx-auto"
              />
              <p className="capitalize font-semibold mt-2">{pokemon.name}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
