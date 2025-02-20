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

export async function generateMetadata({ params }: { params: { id: string } }) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.id}`);
  if (!res.ok) return { title: "ポケモン図鑑" };

  const pokemon = await res.json();
  return {
    title: `ポケモン図鑑 | ${pokemon.name}`,
  };
}

// 進化チェーンを取得する関数
async function fetchEvolutionChain(pokemonName: string): Promise<EvolutionChain[][]> {
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
  if (!speciesRes.ok) return [];

  const speciesData = await speciesRes.json();
  const evolutionChainUrl = speciesData.evolution_chain.url;

  const evolutionRes = await fetch(evolutionChainUrl);
  if (!evolutionRes.ok) return [];

  const evolutionData = await evolutionRes.json();
  let evolutionList: EvolutionChain[][] = [];

  // 進化段階を再帰的に取得する関数
  function extractEvolutions(stage: any, depth = 0) {
    if (!evolutionList[depth]) evolutionList[depth] = [];

    evolutionList[depth].push({
      species_name: stage.species.name,
      image_url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${stage.species.url.split("/").slice(-2, -1)[0]}.png`
    });

    // 複数の進化先を取得
    for (const nextStage of stage.evolves_to) {
      extractEvolutions(nextStage, depth + 1);
    }
  }

  extractEvolutions(evolutionData.chain);
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
          {evolutionChain.map((stage, stageIndex) => (
            <div key={stageIndex} className="flex items-center justify-center gap-4 mb-4">
              {stage.map((evo, index) => (
                <div key={index} className="text-center">
                  <Image src={evo.image_url} alt={evo.species_name} width={100} height={100} />
                  <p className="capitalize mt-2">{evo.species_name}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <a href="/" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        図鑑に戻る
      </a>
    </div>
  );
}
