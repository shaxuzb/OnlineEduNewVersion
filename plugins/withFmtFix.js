const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

module.exports = function withFmtFix(config) {
    return withDangerousMod(config, [
        "ios",
        async (config) => {
            const podfilePath = path.join(
                config.modRequest.platformProjectRoot,
                "Podfile"
            );

            if (!fs.existsSync(podfilePath)) return config;

            let podfile = fs.readFileSync(podfilePath, "utf8");

            const marker = "# @generated begin fmt-xcode-26-fix";

            if (podfile.includes(marker)) {
                return config;
            }

            const patchCode = `
  ${marker}
  fmt_base = File.join(installer.sandbox.pod_dir('fmt'), 'include', 'fmt', 'base.h')
  if File.exist?(fmt_base)
    content = File.read(fmt_base)
    patched = content.gsub(/^#\\s*define FMT_USE_CONSTEVAL 1$/, '# define FMT_USE_CONSTEVAL 0')
    if patched != content
      File.chmod(0644, fmt_base)
      File.write(fmt_base, patched)
      Pod::UI.puts "Patched fmt: FMT_USE_CONSTEVAL=0 for Xcode 26.4"
    end
  end
  # @generated end fmt-xcode-26-fix
`;

            if (podfile.match(/post_install do \|installer\|/)) {
                podfile = podfile.replace(
                    /post_install do \|installer\|/,
                    (match) => `${match}\n${patchCode}`
                );
            } else {
                podfile += `

post_install do |installer|
${patchCode}
end
`;
            }

            fs.writeFileSync(podfilePath, podfile);
            return config;
        },
    ]);
};