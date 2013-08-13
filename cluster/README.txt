Clustering
==========

These scripts are intended to take an installation of alfresco and split it into multiple installs, each bound to a local network interface to allow running multiple instances on one box.

Usage:
======

Configure the external IP of the box in clustering.properties then:

    ./cluster.sh

To thrown the cluster away:

    ./nuke-cluster.sh
