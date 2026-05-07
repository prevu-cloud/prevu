# Prevu Staging Ubuntu Image

This directory defines the target base image for Prevu environments.

The production image should be a self-built Ubuntu qcow2 disk, published through your preferred image distribution pipeline. The local development path currently validates the same provisioning contract by importing the official Ubuntu Noble cloud image and applying the Prevu environment initialization contract.

## Runtime Contract

The VM must provide:

- user: `prevu`
- workspace: `/workspace`
- metadata: `/opt/prevu/environment.json`
- provision marker: `/opt/prevu/provisioned`
- SSH server enabled
- Docker and Docker Compose available to `prevu`
- Git, curl, jq, build-essential, Python 3, Go, and Bun

## Base Image

The local build helper starts from:

```text
https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

This is not the final branded Prevu image. It is the development validation image until the qcow2 build pipeline is added.

## Build Pipeline Target

The next image pipeline should:

1. Start from Ubuntu Noble cloud image.
2. Install the packages listed in `cloud-init-contract.yaml`.
3. Create the `prevu` user and `/workspace`.
4. Enable SSH and Docker.
5. Install Bun for the `prevu` user.
6. Write `/opt/prevu/provisioned`.
7. Export qcow2.
8. Publish the disk through your preferred image distribution pipeline.
