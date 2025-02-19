import { notFound } from "next/navigation";
import Image from "next/image";

type Pokemon = {
  name: string;
  id: number;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
};

export default async function PokemonDetail({ params }: { params: { id: string } }) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.id}`);

  if (!res.ok) return notFound(); // IDが無効な場合は404ページ

  const pokemon: Pokemon = await res.json();
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold capitalize mb-4">{pokemon.name}</h1>
      <Image 
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
        alt={pokemon.name}
        width={200}
        height={200}
        className="mb-4"
      />
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-lg"><strong>ID:</strong> {pokemon.id}</p>
        <p className="text-lg"><strong>Height:</strong> {pokemon.height / 10} m</p>
        <p className="text-lg"><strong>Weight:</strong> {pokemon.weight / 10} kg</p>
        <p className="text-lg"><strong>Type:</strong> {pokemon.types.map(t => t.type.name).join(", ")}</p>
      </div>
      <a href="/" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        図鑑に戻る
      </a>
    </div>
  );
}
