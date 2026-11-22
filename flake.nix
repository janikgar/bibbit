{
  description = "Ansible";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-26.05";

  outputs = { self, nixpkgs }: {
    packages.x86_64-linux = {
      default = self.packages.x86_64-linux.node;
      node = nixpkgs.legacyPackages.x86_64-linux.nodejs_26;
    };
  };
}
