import {
  createV1,
  findMetadataPda,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import {
  createSignerFromKeypair,
  percentAmount,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import fs from "fs";

const umi = createUmi("https://api.mainnet-beta.solana.com")
  .use(mplTokenMetadata())
  .use(mplToolbox());

const secretKey = JSON.parse(
  fs.readFileSync("/Users/eurobae/.config/solana/memecoin.json", "utf8")
);
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

const mint = publicKey("2eG3tmGcHPTwFrw21nitCSufse4HMcmmdDtSYGtTrWFL");

const tokenMetadata = {
  name: "QUANTIOUS",
  symbol: "QTS",
  uri: "https://raw.githubusercontent.com/eurobin39/Quantious/main/metadata.json",
};

async function addMetadata() {
  console.log("Mint:", mint.toString());
  console.log("Identity:", umi.identity.publicKey.toString());

  const metadataPda = await findMetadataPda(umi, { mint });
  console.log("Metadata PDA:", metadataPda.toString());

  const tx = await createV1(umi, {
    mint,
    authority: umi.identity,
    payer: umi.identity,
    mintAuthority: umi.identity,              // ✅ 추가
    updateAuthority: umi.identity,
    name: tokenMetadata.name,
    symbol: tokenMetadata.symbol,
    uri: tokenMetadata.uri,
    sellerFeeBasisPoints: percentAmount(0),
    tokenStandard: TokenStandard.Fungible,
  }).sendAndConfirm(umi);

  const txSig = base58.deserialize(tx.signature);
  console.log("✅ Metadata successfully created!");
  console.log(`Explorer: https://explorer.solana.com/tx/${txSig}?cluster=mainnet-beta`);
}

addMetadata().catch((err) => console.error(err));
