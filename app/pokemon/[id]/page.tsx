import { notFound } from "next/navigation";
import Image from "next/image";

type Pokemon = {
  name: string;
  id: number;
  sprites: { front_default: string };
};

type EvolutionChain = {
  species_name: string;
  image_url: string;
};

async function fetchEvolutionChain(pokemonName: string): Promise<EvolutionChain[]> {
  // ① ポケモンのspecies情報を取得
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
  if (!speciesRes.ok) return [];

  const speciesData = await speciesRes.json();
  const evolutionChainUrl = speciesData.evolution_chain.url;

  // ② 進化チェーンのデータを取得
  const evolutionRes = await fetch(evolutionChainUrl);
  if (!evolutionRes.ok) return [];

  const evolutionData = await evolutionRes.json();
  let evolutionList: EvolutionChain[] = [];

  // ③ 進化の流れを解析
  let evolutionStage = evolutionData.chain;
  while (evolutionStage) {
    const speciesName = evolutionStage.species.name;
    const id = evolutionStage.species.url.split("/").slice(-2, -1)[0];
    evolutionList.push({
      species_name: speciesName,
      image_url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
    });
    evolutionStage = evolutionStage.evolves_to[0]; // 次の進化段階へ
  }

  return evolutionList;
}

export default async function PokemonDetail({ params }: { params: { id: string } }) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.id}`);
  if (!res.ok) return notFound();

  const pokemon: Pokemon = await res.json();
  const evolutionChain = await fetchEvolutionChain(pokemon.name);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold capitalize mb-4">{pokemon.name}</h1>
      <Image 
        src={pokemon.sprites.front_default}
        alt={pokemon.name}
        width={200}
        height={200}
        className="mb-4"
      />
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-lg"><strong>ID:</strong> {pokemon.id}</p>
      </div>

      {/* 進化チェーンの表示 */}
      {evolutionChain.length > 1 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">進化チェーン</h2>
          <div className="flex items-center justify-center gap-4">
            {evolutionChain.map((evo, index) => (
              <div key={index} className="text-center">
                <Image src={evo.image_url} alt={evo.species_name} width={100} height={100} />
                <p className="capitalize mt-2">{evo.species_name}</p>
                {index < evolutionChain.length - 1 && <p>➡</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <a href="/" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        図鑑に戻る
      </a>
    </div>
  );
}
