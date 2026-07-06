# CI workflow (manual install step)
#
# GitHub blocks third-party apps from writing to .github/workflows/ without the
# 'workflows' permission. This file is committed here as ci/ci.yml. To enable CI:
#
#   mkdir -p .github/workflows && cp ci/ci.yml .github/workflows/ci.yml
#   git add .github/workflows/ci.yml && git commit -m "Enable CI" && git push
