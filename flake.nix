{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
  };

  outputs = { self, nixpkgs }:
    let
      inherit (nixpkgs) lib;

      makePackage = (system: dev:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
        in
        rec {
          default = pkgs.buildNpmPackage rec{
            pname = "chatsounds-converter";
            version = "${self.shortRev or self.dirtyShortRev}";

            src = lib.sourceByRegex ./. [
              "^build\.js$"
              "^client(/.*)?$"
              "^package-lock\.json$"
              "^package\.json$"
              "^server(/.*)?$"
              "^tsconfig\.json$"
            ];

            npmDepsHash = "sha256-SlbRaeEXu2dPDhZV2/PM4LRHRob0FYqrexwqjqiYOj4=";

            postFixup = with pkgs; ''
              wrapProgram $out/bin/${meta.mainProgram} \
                --prefix PATH : ${lib.makeBinPath [ ffmpeg ]}
            '';

            nativeBuildInputs = with pkgs; if dev
            then [
              ffmpeg
              clippy
            ]
            else [ ];

            meta.mainProgram = "chatsounds-converter";
          };

          docker = pkgs.dockerTools.streamLayeredImage {
            name = "chatsounds-converter";
            tag = "latest";

            fakeRootCommands = ''
              mkdir tmp \
                && chmod -v 1777 tmp
            '';
            contents = with pkgs; with pkgs.dockerTools; [
              default

              binSh
              caCertificates
              coreutils
              usrBinEnv
              (fakeNss.override {
                extraPasswdLines = [ "user:x:1000:1000:user:/tmp:/bin/sh" ];
                extraGroupLines = [ "user:x:1000:1000" ];
              })
            ];

            config = {
              Entrypoint = [ "${pkgs.tini}/bin/tini" "--" ];
              Cmd = [ (lib.getExe default) ];
              Env = [ "NODE_ENV=production" ];

              ExposedPorts = { "8080/tcp" = { }; };
              User = "1000:1000";
              WorkingDir = "/tmp";
            };
          };
        }
      );
    in
    builtins.foldl' lib.recursiveUpdate { } (builtins.map
      (system: {
        devShells.${system} = makePackage system true;
        packages.${system} = makePackage system false;
      })
      lib.systems.flakeExposed);
}
